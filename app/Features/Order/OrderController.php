<?php

namespace App\Features\Order;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        // Ambil semua kolom dari model kecuali yang tersembunyi
        $model = new Order;
        $columns = array_diff($model->getConnection()->getSchemaBuilder()->getColumnListing($model->getTable()), $model->getHidden());

        $query = Order::query();

        // Logika untuk Pencarian (Search) di semua kolom
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request, $columns) {
                foreach ($columns as $column) {
                    $q->orWhere($column, 'like', '%' . $request->search . '%');
                }
            });
        }

        // Logika untuk Pengurutan (Sort)
        if ($request->filled('sort_by') && $request->filled('sort_dir')) {
            $query->orderBy($request->sort_by, $request->sort_dir);
        } else {
            $query->latest(); // Urutan default jika tidak ada sort
        }

        return Inertia::render('Features/Order/Index', [
            // Kirim data yang sudah difilter dan diurutkan
            'orders' => $query->with('user')->paginate(10)->withQueryString(),
            // Kirim kembali filter yang sedang aktif ke view
            'filters' => $request->only(['search', 'sort_by', 'sort_dir']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Features/Order/FormPage');
    }

    public function store(Request $request)
    {
        $request->validate([
            'selected_items' => 'required|array|min:1',
            'selected_items.*' => 'string', // Pastikan setiap item adalah ID string
        ]);

        $allCartItems = session('cart', []);
        $selectedItemIds = $request->input('selected_items');

        // Filter keranjang untuk hanya memproses item yang dipilih
        $itemsToProcess = array_filter($allCartItems, function ($item) use ($selectedItemIds) {
            return in_array($item['id'], $selectedItemIds);
        });

        if (empty($itemsToProcess)) {
            return redirect()->back()->withErrors(['cart' => 'No selected items to process.']);
        }

        $productIds = array_column($itemsToProcess, 'product_id');
        $productPrices = Product::whereIn('id', $productIds)->pluck('price', 'id');

        $totalPrice = array_reduce($itemsToProcess, function ($carry, $item) use ($productPrices) {
            $price = $productPrices[$item['product_id']] ?? 0;
            return $carry + ($price * $item['quantity']);
        }, 0);

        $order = null;
        \Illuminate\Support\Facades\DB::transaction(function () use ($itemsToProcess, $totalPrice, $productPrices, &$order) {
            $order = Order::create([
                'user_id' => auth()->id(),
                'order_number' => 'ORD-' . strtoupper(uniqid()),
                'total_amount' => $totalPrice,
                'order_status' => 'pending',
            ]);

            foreach ($itemsToProcess as $item) {
                $price = $productPrices[$item['product_id']] ?? 0;
                $order->items()->create([
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'price' => $price,
                    'design_info' => [
                        'custom_design_url' => $item['custom_design_url'] ?? null,
                        'design_template_id' => $item['design_template_id'] ?? null,
                        'notes' => $item['notes'] ?? null,
                    ],
                ]);
            }
        });

        // Hapus hanya item yang sudah di-checkout dari sesi
        $remainingCartItems = array_filter($allCartItems, function ($item) use ($selectedItemIds) {
            return !in_array($item['id'], $selectedItemIds);
        });
        session(['cart' => $remainingCartItems]);

        return redirect()->route('orders.show', $order)->with('message', 'Order created successfully.');
    }

    public function show(Order $order)
    {
        return Inertia::render('Features/Order/Show', [
            'order' => $order->load('user', 'items.product'),
        ]);
    }

    public function edit(Order $order)
    {
        return Inertia::render('Features/Order/FormPage', [
            'item' => $order,
        ]);
    }

    public function update(Request $request, Order $order)
    {
        $request->validate([
            'order_status' => 'required|in:pending,processing,shipped,completed,cancelled',
            'estimated_completion_date' => 'nullable|date',
            'admin_notes' => 'nullable|string',
        ]);

        $order->update($request->only(['order_status', 'estimated_completion_date', 'admin_notes']));

        return redirect()->route('orders.show', $order)->with('message', 'Order updated successfully.');
    }

    public function destroy(Order $order)
    {
        $order->delete();
        return redirect()->route('orders.index')->with('message', 'Order deleted successfully.');
    }
}
