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

    // Shipping methods are now fetched dynamically from RajaOngkir API

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
            'paymentMethods' => self::PAYMENT_METHODS,
        ]);
    }

    /**
     * Store a newly created order from the customer checkout.
     * Returns JSON with snap_token for Midtrans payment.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'shipping_address.name' => 'required|string|max:255',
            'shipping_address.address' => 'required|string|max:500',
            'shipping_address.city' => 'required|string|max:100',
            'shipping_address.city_id' => 'required|integer',
            'shipping_address.province' => 'required|string|max:100',
            'shipping_address.province_id' => 'required|integer',
            'shipping_address.postal_code' => 'required|string|max:10',
            'shipping_address.phone' => 'required|string|max:20',
            'shipping_method' => 'required|array',
            'shipping_method.courier' => 'required|string',
            'shipping_method.service' => 'required|string',
            'shipping_method.cost' => 'required|integer',
            'shipping_method.etd' => 'nullable|string',
            'selected_items' => 'required|array|min:1',
            'selected_items.*' => 'string',
        ]);

        $allCartItems = session('cart.items', []);
        $selectedItemIds = $validated['selected_items'];

        // 1. Filter cart items
        $itemsToProcess = array_filter($allCartItems, function ($item) use ($selectedItemIds) {
            return in_array($item['id'], $selectedItemIds);
        });

        if (empty($itemsToProcess)) {
            return response()->json(['error' => 'Tidak ada item yang dipilih untuk diproses.'], 422);
        }

        // 2. Get product prices from database
        $productIds = array_column($itemsToProcess, 'product_id');
        $productsById = Product::whereIn('id_produk', $productIds)->get()->keyBy('id_produk');

        // 3. Calculate subtotal
        $subtotal = 0;
        foreach ($itemsToProcess as $item) {
            $product = $productsById->get($item['product_id']);
            if ($product) {
                $subtotal += $item['price'] * $item['quantity'];
            }
        }

        // 4. Get shipping cost
        $shippingCost = $validated['shipping_method']['cost'];
        $shippingMethodName = $validated['shipping_method']['courier'] . ' - ' . $validated['shipping_method']['service'];

        // 5. Calculate tax (11%)
        $tax = $subtotal * 0.11;

        // 6. Calculate total
        $totalPrice = $subtotal + $shippingCost + $tax;

        $order = null;
        try {
            DB::transaction(function () use ($validated, $itemsToProcess, $totalPrice, $shippingCost, $shippingMethodName, $productsById, &$order) {
                // Create order entry
                $order = Order::create([
                    'user_id' => auth()->id(),
                    'order_status' => 'pending',
                    'total_price' => $totalPrice,
                    'shipping_address' => $validated['shipping_address'],
                    'shipping_cost' => $shippingCost,
                    'shipping_method' => $shippingMethodName,
                    'payment_method' => 'midtrans', // Will be updated by webhook
                    'payment_status' => 'unpaid',
                ]);

                // Create order items
                foreach ($itemsToProcess as $item) {
                    $product = $productsById->get($item['product_id']);
                    if ($product) {
                        $order->items()->create([
                            'product_id_produk' => $item['product_id'],
                            'quantity' => $item['quantity'],
                            'price' => $item['price'],
                            'options' => [
                                'variant' => $item['variant'] ?? null,
                                'design' => $item['design'] ?? null,
                                'note' => $item['note'] ?? null,
                            ],
                        ]);
                    }
                }
            });

            // 7. Generate Midtrans Snap Token
            \Midtrans\Config::$serverKey = config('midtrans.server_key');
            \Midtrans\Config::$isProduction = config('midtrans.is_production');
            \Midtrans\Config::$isSanitized = config('midtrans.is_sanitized');
            \Midtrans\Config::$is3ds = config('midtrans.is_3ds');

            $order->load('items.product');

            $transactionDetails = [
                'order_id' => 'ORDER-' . $order->id . '-' . time(),
                'gross_amount' => (int) $order->total_price,
            ];

            $customerDetails = [
                'first_name' => $validated['shipping_address']['name'],
                'email' => auth()->user()->email,
                'phone' => $validated['shipping_address']['phone'],
            ];

            $itemDetails = [];
            foreach ($order->items as $item) {
                $itemDetails[] = [
                    'id' => $item->product_id_produk,
                    'price' => (int) $item->price,
                    'quantity' => $item->quantity,
                    'name' => substr($item->product->nama_produk ?? 'Product', 0, 50),
                ];
            }

            // Add shipping cost
            if ($order->shipping_cost > 0) {
                $itemDetails[] = [
                    'id' => 'SHIPPING',
                    'price' => (int) $order->shipping_cost,
                    'quantity' => 1,
                    'name' => 'Biaya Pengiriman',
                ];
            }

            // Add tax
            $taxAmount = (int) round($subtotal * 0.11);
            if ($taxAmount > 0) {
                $itemDetails[] = [
                    'id' => 'TAX',
                    'price' => $taxAmount,
                    'quantity' => 1,
                    'name' => 'PPN (11%)',
                ];
            }

            $transactionPayload = [
                'transaction_details' => $transactionDetails,
                'customer_details' => $customerDetails,
                'item_details' => $itemDetails,
            ];

            $snapToken = \Midtrans\Snap::getSnapToken($transactionPayload);

            // Save snap token to order
            $order->update([
                'snap_token' => $snapToken,
                'midtrans_order_id' => $transactionDetails['order_id'],
            ]);

            // 8. Remove checked out items from cart
            $remainingCartItems = array_filter($allCartItems, function ($item) use ($selectedItemIds) {
                return !in_array($item['id'], $selectedItemIds);
            });

            $newSubtotal = array_reduce($remainingCartItems, function ($carry, $item) {
                return $carry + ($item['price'] * $item['quantity']);
            }, 0);

            session(['cart' => [
                'items' => $remainingCartItems,
                'subtotal' => $newSubtotal,
            ]]);

            // 9. Return JSON with snap token
            return response()->json([
                'success' => true,
                'order_id' => $order->id,
                'snap_token' => $snapToken,
                'message' => 'Pesanan berhasil dibuat. Silakan lanjutkan pembayaran.',
            ]);

        } catch (\Exception $e) {
            Log::error('Order creation failed: ' . $e->getMessage());
            return response()->json([
                'error' => 'Terjadi kesalahan saat membuat pesanan. Silakan coba lagi.',
                'details' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
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

        $order->load('user', 'items.product');

        // Pre-fetch all attributes and attribute values for efficiency
        $allAttributes = \App\Features\Product\Attribute::all()->keyBy('id');
        $allAttributeValues = \App\Features\Product\AttributeValue::all()->keyBy('id');

        // Resolve design template paths and variant names for each order item
        $order->items->transform(function ($item) use ($allAttributes, $allAttributeValues) {
            $options = $item->options ?? [];

            // Resolve variant IDs to names
            if (isset($options['variant']) && is_array($options['variant'])) {
                $resolvedVariants = [];

                foreach ($options['variant'] as $attributeId => $valueId) {
                    // Get attribute name
                    $attribute = $allAttributes->get($attributeId);
                    $attributeName = $attribute ? $attribute->name : "Attribute #$attributeId";

                    // Get attribute value name
                    $attributeValue = $allAttributeValues->get($valueId);
                    $valueName = $attributeValue ? $attributeValue->value : "Value #$valueId";

                    $resolvedVariants[$attributeName] = $valueName;
                }

                $options['variant'] = $resolvedVariants;
            }

            // Resolve design template paths
            if (isset($options['design'])) {
                $design = $options['design'];

                // If design type is template and value is an ID (numeric), look up the template
                if (
                    isset($design['type']) &&
                    $design['type'] === 'template' &&
                    isset($design['value']) &&
                    is_numeric($design['value'])
                ) {
                    $template = \App\Features\DesignTemplate\DesignTemplate::find($design['value']);
                    if ($template) {
                        // Update the options with resolved template data
                        $options['design'] = [
                            'type' => 'template',
                            'value' => $template->file_path ?? $template->thumbnail_path,
                            'original_filename' => $template->name,
                            'template_id' => $design['value'],
                        ];
                    }
                }

                // If design type is upload and value is a path, ensure it's a string
                if (
                    isset($design['type']) &&
                    $design['type'] === 'upload' &&
                    isset($design['value'])
                ) {
                    // Ensure value is a string
                    $options['design']['value'] = (string) $design['value'];
                }
            }

            $item->options = $options;
            return $item;
        });

        return Inertia::render('Features/Order/Show', [
            'order' => $order,
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

        return redirect()->back()->with('message', 'Order updated successfully.');
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
            ->with(['items.product']) 
            ->withCount('reviews') // Cek apakah ada review
            ->withCount(['reviews as reviews_edited_count' => function ($query) {
                $query->where('is_edited', true);
            }])
            ->latest() 
            ->paginate(10);

        // 2. Render halaman React BARU, kirim data 'orders' sebagai props
        return Inertia::render('Features/Order/MyOrdersPage', [
            'orders' => $orders,
        ]);
    }
}
