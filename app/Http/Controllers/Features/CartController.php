<?php

namespace App\Http\Controllers\Features;

use App\Features\Product\Product;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\JsonResponse;

class CartController extends Controller
{
    public function getItemDetails(string $cartItemId): JsonResponse
    {
        $cart = session()->get('cart', []);
        $cartItem = null;

        // Cari item di dalam 'items'
        if (isset($cart['items']) && isset($cart['items'][$cartItemId])) {
            $cartItem = $cart['items'][$cartItemId];
        }

        if (!$cartItem) {
            return response()->json(['message' => 'Item tidak ditemukan'], 404);
        }

        // Muat data produk lengkap beserta relasi yang diperlukan oleh Quick View
        $product = Product::with('category', 'attributeValues.attribute', 'designTemplates')
            ->find($cartItem['product_id']);

        if (!$product) {
            return response()->json(['message' => 'Produk tidak ditemukan'], 404);
        }

        // Gabungkan data produk dengan detail pilihan dari sesi
        return response()->json([
            'product' => $product,
            'selectedOptions' => $cartItem,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'product_id' => ['required', 'exists:products,id_produk'],
            'quantity' => ['required', 'integer', 'min:1'],
            'variant' => ['nullable', 'array'],
            'design' => ['nullable', 'array'],
        ]);

        $product = Product::where('id_produk', $request->product_id)->firstOrFail();
        $cart = session()->get('cart', ['items' => [], 'subtotal' => 0]);

        // Generate a unique key for each cart item based on product ID and options
        $optionsIdentifier = md5(serialize($request->variant) . serialize($request->design));
        $cartItemId = $product->id_produk . '-' . $optionsIdentifier;

        // Check if item already exists in cart
        if (isset($cart['items'][$cartItemId])) {
            // If it exists, just update the quantity
            $cart['items'][$cartItemId]['quantity'] += $request->quantity;
        } else {
            // If not, add as a new item
            $variantDetails = $this->getVariantDetails($request->variant);

            $cart['items'][$cartItemId] = [
                'id' => $cartItemId,
                'product_id' => $product->id_produk,
                'name' => $product->nama_produk,
                'price' => $product->harga + $variantDetails['price_modifier'],
                'image' => $product->gambar_url,
                'quantity' => $request->quantity,
                'variant' => $variantDetails['details'],
                'design' => $request->design,
            ];
        }

        // Recalculate subtotal
        $this->recalculateCartSubtotal($cart);

        session()->put('cart', $cart);

        return redirect()->back()->with('success', 'Product added to cart successfully!');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $cartItemId)
    {
        $request->validate([
            'product_id' => ['required', 'exists:products,id_produk'],
            'quantity' => ['required', 'integer', 'min:1'],
            'variant' => ['nullable', 'array'],
            'design' => ['nullable', 'array'],
            'note' => ['nullable', 'string'],
        ]);

        $cart = session()->get('cart', ['items' => [], 'subtotal' => 0]);

        if (!isset($cart['items'][$cartItemId])) {
            return redirect()->back()->with('error', 'Item tidak ditemukan di keranjang.');
        }

        $product = Product::findOrFail($request->product_id);

        unset($cart['items'][$cartItemId]);

        $optionsIdentifier = md5(serialize($request->variant) . serialize($request->design));
        $newCartItemId = $product->id_produk . '-' . $optionsIdentifier;

        $variantDetails = $this->getVariantDetails($request->variant);

        $cart['items'][$newCartItemId] = [
            'id' => $newCartItemId,
            'product_id' => $product->id_produk,
            'name' => $product->nama_produk,
            'price' => $product->harga + $variantDetails['price_modifier'],
            'image' => $product->gambar_url,
            'quantity' => $request->quantity,
            'variant' => $request->variant,
            'note' => $request->note,
            'design' => $request->design,
        ];

        $this->recalculateCartSubtotal($cart);
        session()->put('cart', $cart);

        return redirect()->back()->with('success', 'Keranjang berhasil diperbarui!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($cartItemId)
    {
        $cart = session()->get('cart', ['items' => [], 'subtotal' => 0]);

        if (isset($cart['items'][$cartItemId])) {
            unset($cart['items'][$cartItemId]);
            $this->recalculateCartSubtotal($cart);
            session()->put('cart', $cart);
        }

        return redirect()->back()->with('success', 'Item removed from cart successfully!');
    }

    /**
     * Get variant details and price modifier.
     */
    private function getVariantDetails($variantData): array
    {
        // This is a placeholder. In a real application, you would fetch
        // the attribute values from the database to get their names and price modifiers.
        // For now, we'll just format the data.
        if (empty($variantData)) {
            return ['price_modifier' => 0, 'details' => []];
        }

        $details = [];
        $price_modifier = 0;

        // Assuming variantData is ['attribute_id' => 'value_id', ...]
        // You would need to query your database to get the actual names and prices.
        foreach ($variantData as $attributeId => $valueId) {
            // Placeholder logic
            $details[] = "Option {$attributeId}: Value {$valueId}";
        }


        return [
            'price_modifier' => $price_modifier,
            'details' => $details,
        ];
    }

    /**
     * Recalculate the cart's subtotal.
     */
    private function recalculateCartSubtotal(&$cart)
    {
        $subtotal = 0;
        foreach ($cart['items'] as $item) {
            $subtotal += $item['price'] * $item['quantity'];
        }
        $cart['subtotal'] = $subtotal;
    }
}
