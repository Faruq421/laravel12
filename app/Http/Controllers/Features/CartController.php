<?php

namespace App\Http\Controllers\Features;

use App\Features\Product\Product;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class CartController extends Controller
{
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
