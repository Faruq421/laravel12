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
        // SYNC_VALIDATION_STORE_START
        Order::create($request->all());
        // SYNC_VALIDATION_STORE_END
        return redirect()->route('orders.index')->with('message', 'Order created successfully.');
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
