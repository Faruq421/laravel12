<?php

namespace App\Features\Order;

use App\Features\Product\Product;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class OrderController extends Controller
{
    /**
     * Display a listing of the resource for Admin.
     */
    public function index(Request $request)
    {
        $user = auth()->user();

        // Logic for Customers
        if ($user->role !== 'admin') {
            $query = Order::where('user_id', $user->id)
                ->with('items.product')
                ->latest();

            return Inertia::render('Features/Order/Index', [
                'orders' => $query->paginate(10)->withQueryString(),
            ]);
        }

        // Logic for Admins
        $model = new Order;
        $columns = array_diff($model->getConnection()->getSchemaBuilder()->getColumnListing($model->getTable()), $model->getHidden());
        $query = Order::query();

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request, $columns) {
                foreach ($columns as $column) {
                    $q->orWhere($column, 'like', '%' . $request->search . '%');
                }
            });
        }

        if ($request->filled('sort_by') && $request->filled('sort_dir')) {
            $query->orderBy($request->sort_by, $request->sort_dir);
        } else {
            $query->latest();
        }

        return Inertia::render('Features/Order/Index', [
            'items' => $query->with('user')->paginate(10)->withQueryString(),
            'filters' => $request->only(['search', 'sort_by', 'sort_dir']),
        ]);
    }

    /**
     * Show the checkout page for the customer.
     */
    public function create(Request $request)
    {
        $request->validate([
            'selected_items' => 'sometimes|array',
            'selected_items.*' => 'string',
        ]);

        $allCartItems = session('cart.items', []);
        $selectedItemIds = $request->input('selected_items');

        // Jika tidak ada item yang dipilih secara eksplisit, anggap semua item dipilih
        if (empty($selectedItemIds)) {
            $itemsForCheckout = $allCartItems;
        } else {
            // Filter keranjang berdasarkan item yang dipilih
            $itemsForCheckout = array_filter($allCartItems, function ($item) use ($selectedItemIds) {
                return in_array($item['id'], $selectedItemIds);
            });
        }

        if (empty($itemsForCheckout)) {
            // Redirect kembali ke halaman sebelumnya atau ke halaman keranjang dengan pesan error
            return redirect()->back()->withErrors(['cart' => 'Anda harus memilih setidaknya satu item untuk checkout.']);
        }

        return Inertia::render('Features/Order/Checkout', [
            'cartItems' => array_values($itemsForCheckout),
        ]);
    }

    /**
     * Store a newly created order from the customer checkout.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'shipping_address.name' => 'required|string|max:255',
            'shipping_address.address' => 'required|string|max:500',
            'shipping_address.city' => 'required|string|max:100',
            'shipping_address.postal_code' => 'required|string|max:10',
            'shipping_address.phone' => 'required|string|max:20',
            'selected_items' => 'required|array|min:1',
            'selected_items.*' => 'string', // Array of selected cart item IDs
        ]);

        $allCartItems = session('cart.items', []);
        $selectedItemIds = $validated['selected_items'];

        // 1. Filter keranjang untuk hanya mendapatkan item yang dipilih
        $itemsToProcess = array_filter($allCartItems, function ($item) use ($selectedItemIds) {
            return in_array($item['id'], $selectedItemIds);
        });

        if (empty($itemsToProcess)) {
            return redirect()->route('checkout.create')->withErrors(['cart' => 'Tidak ada item yang dipilih untuk diproses.']);
        }

        // 2. Dapatkan harga produk terbaru dari database untuk keamanan
        $productIds = array_column($itemsToProcess, 'product_id');
        $productsById = Product::whereIn('id_produk', $productIds)->get()->keyBy('id_produk');

        // 3. Hitung total harga berdasarkan data dari database
        $totalAmount = 0;
        foreach ($itemsToProcess as $item) {
            $product = $productsById->get($item['product_id']);
            if ($product) {
                // Note: Anda mungkin perlu menambahkan logika harga varian di sini jika ada
                $totalAmount += $product->harga * $item['quantity'];
            }
        }

        $order = null;
        try {
            DB::transaction(function () use ($validated, $itemsToProcess, $totalAmount, $productsById, &$order) {
                // 4. Buat entri di tabel 'orders'
                $order = Order::create([
                    'user_id' => auth()->id(),
                    'order_number' => 'ORD-' . strtoupper(uniqid()),
                    'total_amount' => $totalAmount,
                    'order_status' => 'pending', // Status awal
                    'shipping_address' => $validated['shipping_address'],
                ]);

                // 5. Pindahkan item dari keranjang ke 'order_items'
                foreach ($itemsToProcess as $item) {
                    $product = $productsById->get($item['product_id']);
                    if ($product) {
                        $order->items()->create([
                            'product_id' => $item['product_id'],
                            'quantity' => $item['quantity'],
                            'price' => $product->harga, // Harga saat checkout
                            // Anda bisa menambahkan detail lain seperti varian di sini
                        ]);
                    }
                }
            });

            // 6. Hapus item yang sudah di-checkout dari sesi keranjang
            $remainingCartItems = array_filter($allCartItems, function ($item) use ($selectedItemIds) {
                return !in_array($item['id'], $selectedItemIds);
            });
            session(['cart.items' => $remainingCartItems]);

            // 7. Redirect ke halaman sukses atau detail pesanan
            return redirect()->route('orders.show', $order)->with('message', 'Pesanan Anda berhasil dibuat!');

        } catch (\Exception $e) {
            Log::error('Order creation failed: ' . $e->getMessage());
            return redirect()->route('checkout.create')->withErrors(['error' => 'Terjadi kesalahan saat membuat pesanan. Silakan coba lagi.']);
        }
    }


    /**
     * Display the specified resource for Admin.
     */
    public function show(Order $order)
    {
        // Pastikan pengguna hanya bisa melihat order miliknya, kecuali admin
        if (auth()->user()->role !== 'admin' && $order->user_id !== auth()->id()) {
            abort(403);
        }

        return Inertia::render('Features/Order/Show', [
            'order' => $order->load('user', 'items.product'),
        ]);
    }

    /**
     * Show the form for editing the specified resource for Admin.
     */
    public function edit(Order $order)
    {
        return Inertia::render('Features/Order/FormPage', [
            'item' => $order,
        ]);
    }

    /**
     * Update the specified resource in storage for Admin.
     */
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

    /**
     * Remove the specified resource from storage for Admin.
     */
    public function destroy(Order $order)
    {
        $order->delete();
        return redirect()->route('orders.index')->with('message', 'Order deleted successfully.');
    }
}
