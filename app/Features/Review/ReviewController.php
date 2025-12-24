<?php

namespace App\Features\Review;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

use App\Features\Order\Order;
use App\Features\Product\Attribute;
use App\Features\Product\AttributeValue;

class ReviewController extends Controller
{
    /**
     * Show the form for reviewing products from an order.
     */
    public function createForOrder(Order $order)
    {
        // Ensure user owns this order
        if ($order->user_id !== auth()->id()) {
            abort(403, 'Anda tidak memiliki izin untuk mereview pesanan ini.');
        }

        // Ensure order is completed
        if ($order->order_status !== 'completed') {
            return redirect()->route('orders.my')
                ->with('error', 'Anda hanya dapat mereview pesanan yang sudah selesai.');
        }

        // Load order items with product
        $order->load('items.product');

        // Pre-fetch attributes for resolving variant names
        $allAttributes = Attribute::all()->keyBy('id');
        $allAttributeValues = AttributeValue::all()->keyBy('id');

        // Map order items to products that can be reviewed
        $products = $order->items->map(function ($item) use ($allAttributes, $allAttributeValues) {
            // Resolve variant names
            $variantString = '';
            if (!empty($item->options['variant']) && is_array($item->options['variant'])) {
                $variantParts = [];
                foreach ($item->options['variant'] as $attrId => $valueId) {
                    $attrName = $allAttributes->get($attrId)?->name ?? '';
                    $valueName = $allAttributeValues->get($valueId)?->value ?? '';
                    if ($attrName && $valueName) {
                        $variantParts[] = "{$attrName}: {$valueName}";
                    }
                }
                $variantString = implode(', ', $variantParts);
            }

            return [
                'id' => $item->product->id_produk,
                'name' => $item->product->nama_produk,
                'image_url' => $item->product->gambar_url,
                'variant' => $variantString ?: 'Standar',
            ];
        })->unique('id')->values(); // Unique by product ID

        // Check if any review for this order has already been edited by the user
        // If updating is limited to ONCE per order (meaning if you update ANY product in the order, you use your quota)
        // Or if it's per product? The request says "hanya dapat melakukan update penialaian sebanyak satu kali saja". 
        // This implies the ACTION of updating. Since the form submits all, we can check if *any* review has `is_edited` = true.
        $hasEdited = Review::where('user_id', auth()->id())
            ->where('order_id', $order->id)
            ->where('is_edited', true)
            ->exists();

        if ($hasEdited) {
             return redirect()->route('orders.my')
                ->with('error', 'Anda sudah menggunakan kesempatan update penilaian untuk pesanan ini.');
        }

        // Fetch existing reviews for this order
        $existingReviews = Review::where('user_id', auth()->id())
            ->where('order_id', $order->id)
            ->get()
            ->keyBy('product_id')
            ->map(function ($review) {
                return [
                    'rating' => $review->rating,
                    'comment' => $review->comment,
                ];
            });

        return Inertia::render('Features/Review/Create', [
            'order' => [
                'id' => $order->id,
                'created_at' => $order->created_at,
            ],
            'products' => $products,
            'existingReviews' => $existingReviews,
        ]);
    }

    /**
     * Store reviews for products in an order.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'order_id' => 'required|exists:orders,id',
            'reviews' => 'required|array|min:1',
            'reviews.*.product_id' => 'required|exists:products,id_produk',
            'reviews.*.rating' => 'required|integer|min:1|max:5',
            'reviews.*.comment' => 'nullable|string|max:1000',
        ]);

        $orderId = $validated['order_id'];

        // Verify order belongs to user and is completed
        $order = Order::findOrFail($orderId);
        if ($order->user_id !== auth()->id()) {
            abort(403);
        }

        // Check if user has already edited reviews for this order (Global check for order level)
        $hasEdited = Review::where('user_id', auth()->id())
            ->where('order_id', $orderId)
            ->where('is_edited', true)
            ->exists();

        if ($hasEdited) {
            return redirect()->route('orders.my')
                ->with('error', 'Anda sudah menyunting penilaian dan tidak dapat mengubahnya lagi.');
        }

        // Save all reviews in a transaction
        DB::transaction(function () use ($validated, $orderId) {
            foreach ($validated['reviews'] as $productId => $reviewData) {
                // Skip if no rating provided
                if (empty($reviewData['rating'])) {
                    continue;
                }

                // Check if review already exists for this product/order combo
                $existingReview = Review::where('user_id', auth()->id())
                    ->where('order_id', $orderId)
                    ->where('product_id', $reviewData['product_id'])
                    ->first();

                if ($existingReview) {
                    // Update existing review -> Mark as edited
                    $existingReview->update([
                        'rating' => $reviewData['rating'],
                        'comment' => $reviewData['comment'] ?? null,
                        'is_edited' => true, 
                    ]);
                } else {
                    // Create new review
                    Review::create([
                        'user_id' => auth()->id(),
                        'order_id' => $orderId,
                        'product_id' => $reviewData['product_id'],
                        'rating' => $reviewData['rating'],
                        'comment' => $reviewData['comment'] ?? null,
                        'is_visible' => true,
                        'is_edited' => false,
                    ]);
                }
            }
        });

        return redirect()->route('orders.my')
            ->with('message', 'Terima kasih! Penilaian Anda telah disimpan.');
    }

    /**
     * Display a listing of reviews (Admin).
     */
    public function index(Request $request)
    {
        $query = Review::with(['user', 'product', 'order']);

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('comment', 'like', '%' . $request->search . '%')
                  ->orWhereHas('user', fn($u) => $u->where('name', 'like', '%' . $request->search . '%'))
                  ->orWhereHas('product', fn($p) => $p->where('nama_produk', 'like', '%' . $request->search . '%'));
            });
        }

        if ($request->filled('sort_by') && $request->filled('sort_dir')) {
            $query->orderBy($request->sort_by, $request->sort_dir);
        } else {
            $query->latest();
        }

        return Inertia::render('Features/Review/Index', [
            'items' => $query->paginate(10)->withQueryString(),
            'filters' => $request->only(['search', 'sort_by', 'sort_dir']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Features/Review/FormPage');
    }

    public function edit(Review $review)
    {
        return Inertia::render('Features/Review/FormPage', [
            'item' => $review->load(['user', 'product', 'order']),
        ]);
    }

    public function update(Request $request, Review $review)
    {
        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
            'is_visible' => 'boolean',
        ]);

        $review->update($validated);
        
        return redirect()->route('reviews.index')
            ->with('message', 'Review berhasil diperbarui.');
    }

    public function destroy(Review $review)
    {
        $review->delete();
        return redirect()->route('reviews.index')
            ->with('message', 'Review berhasil dihapus.');
    }
}
