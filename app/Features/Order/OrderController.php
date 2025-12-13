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

        // Filter by order status
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('order_status', $request->status);
        }

        // Filter by payment status
        if ($request->filled('payment_status') && $request->payment_status !== 'all') {
            $query->where('payment_status', $request->payment_status);
        }

        if ($request->filled('sort_by') && $request->filled('sort_dir')) {
            $query->orderBy($request->sort_by, $request->sort_dir);
        } else {
            $query->latest();
        }

        return Inertia::render('Features/Order/Index', [
            'items' => $query->with('user', 'items.product')->paginate(10)->withQueryString(),
            'filters' => $request->only(['search', 'sort_by', 'sort_dir', 'status', 'payment_status']),
        ]);
    }

    // Shipping methods available for checkout
    const SHIPPING_METHODS = [
        ['id' => 'jne', 'name' => 'JNE Reguler', 'price' => 15000, 'eta' => '2-3 Hari'],
        ['id' => 'sicepat', 'name' => 'SiCepat BEST', 'price' => 27000, 'eta' => '1 Hari'],
        ['id' => 'gosend', 'name' => 'GoSend Instant', 'price' => 45000, 'eta' => 'Jam ini'],
    ];

    // Payment methods available for checkout
    const PAYMENT_METHODS = [
        ['id' => 'bca', 'name' => 'Transfer Bank BCA', 'description' => 'Cek otomatis'],
        ['id' => 'credit_card', 'name' => 'Kartu Kredit', 'description' => 'Visa / MasterCard'],
    ];

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
            $itemsForCheckout = array_values($allCartItems);
        } else {
            // Filter keranjang berdasarkan item yang dipilih
            $itemsForCheckout = array_values(array_filter($allCartItems, function ($item) use ($selectedItemIds) {
                return in_array($item['id'], $selectedItemIds);
            }));
        }

        if (empty($itemsForCheckout)) {
            // Redirect kembali ke halaman sebelumnya atau ke halaman keranjang dengan pesan error
            return redirect()->back()->withErrors(['cart' => 'Anda harus memilih setidaknya satu item untuk checkout.']);
        }

        // Calculate subtotal from items
        $subtotal = array_reduce($itemsForCheckout, function ($carry, $item) {
            return $carry + ($item['price'] * $item['quantity']);
        }, 0);

        return Inertia::render('Features/Checkout/Index', [
            'cartItems' => $itemsForCheckout,
            'subtotal' => $subtotal,
            'shippingMethods' => self::SHIPPING_METHODS,
            'paymentMethods' => self::PAYMENT_METHODS,
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
            'shipping_method' => 'required|string|in:jne,sicepat,gosend',
            'payment_method' => 'required|string|in:bca,credit_card',
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
        $subtotal = 0;
        foreach ($itemsToProcess as $item) {
            $product = $productsById->get($item['product_id']);
            if ($product) {
                // Use item price from cart (which includes variant modifiers)
                $subtotal += $item['price'] * $item['quantity'];
            }
        }

        // 4. Get shipping cost based on selected method
        $shippingMethodData = collect(self::SHIPPING_METHODS)->firstWhere('id', $validated['shipping_method']);
        $shippingCost = $shippingMethodData ? $shippingMethodData['price'] : 0;

        // 5. Calculate tax (11%)
        $tax = $subtotal * 0.11;

        // 6. Calculate total
        $totalPrice = $subtotal + $shippingCost + $tax;

        $order = null;
        try {
            DB::transaction(function () use ($validated, $itemsToProcess, $totalPrice, $shippingCost, $productsById, &$order) {
                // Create order entry
                $order = Order::create([
                    'user_id' => auth()->id(),
                    'order_status' => 'pending',
                    'total_price' => $totalPrice,
                    'shipping_address' => $validated['shipping_address'],
                    'shipping_cost' => $shippingCost,
                    'shipping_method' => $validated['shipping_method'],
                    'payment_method' => $validated['payment_method'],
                    'payment_status' => 'unpaid',
                ]);

                // Create order items
                foreach ($itemsToProcess as $item) {
                    $product = $productsById->get($item['product_id']);
                    if ($product) {
                        $order->items()->create([
                            'product_id_produk' => $item['product_id'],
                            'quantity' => $item['quantity'],
                            'price' => $item['price'], // Price from cart (includes variant modifier)
                            'options' => [
                                'variant' => $item['variant'] ?? null,
                                'design' => $item['design'] ?? null,
                            ],
                        ]);
                    }
                }
            });

            // 7. Remove checked out items from cart session
            $remainingCartItems = array_filter($allCartItems, function ($item) use ($selectedItemIds) {
                return !in_array($item['id'], $selectedItemIds);
            });

            // Recalculate cart subtotal
            $newSubtotal = array_reduce($remainingCartItems, function ($carry, $item) {
                return $carry + ($item['price'] * $item['quantity']);
            }, 0);

            session(['cart' => [
                'items' => $remainingCartItems,
                'subtotal' => $newSubtotal,
            ]]);

            // 8. Redirect to order detail/success page
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
            'order_status' => 'sometimes|required|in:pending,processing,shipped,completed,cancelled',
            'payment_status' => 'sometimes|required|in:unpaid,paid,expired',
            'tracking_number' => 'nullable|string|max:100',
            'estimated_completion_date' => 'nullable|date',
            'admin_notes' => 'nullable|string',
        ]);

        $order->update($request->only([
            'order_status',
            'payment_status',
            'tracking_number',
            'estimated_completion_date',
            'admin_notes'
        ]));

        // If request expects JSON (from AJAX), return JSON response
        if ($request->expectsJson()) {
            return response()->json(['message' => 'Order updated successfully.', 'order' => $order]);
        }

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

    public function myOrders(Request $request)
    {
        // 1. Ambil pesanan HANYA untuk pengguna yang sedang login
        //    Kita juga memuat relasi 'items' untuk menampilkan detail produk
        $orders = Order::where('user_id', $request->user()->id)
            ->with('items.product') // Asumsi relasi ini ada
            ->latest() // Tampilkan yang terbaru di atas
            ->paginate(10); // Gunakan paginasi

        // 2. Render halaman React BARU, kirim data 'orders' sebagai props
        return Inertia::render('Features/Order/MyOrdersPage', [
            'orders' => $orders,
        ]);
    }
}
