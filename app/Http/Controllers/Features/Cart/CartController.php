<?php

namespace App\Http\Controllers\Features\Cart;

use App\Features\Product\Product;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CartController extends Controller
{
    public function add(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'product_id' => 'required|exists:products,id_produk',
            'quantity' => 'required|integer|min:1',
            'options' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator);
        }

        $product = Product::findOrFail($request->product_id);
        $cart = session()->get('cart', []);

        // Buat ID unik untuk item keranjang berdasarkan produk dan opsinya
        $cartItemId = $product->id_produk . '-' . md5(json_encode($request->options));

        if (isset($cart[$cartItemId])) {
            $cart[$cartItemId]['quantity'] += $request->quantity;
        } else {
            $cart[$cartItemId] = [
                "product_id" => $product->id_produk,
                "name" => $product->nama_produk,
                "quantity" => $request->quantity,
                "price" => $product->harga,
                "options" => $request->options,
                "image" => $product->gambar_url,
            ];
        }

        session()->put('cart', $cart);

        return back()->with('message', 'Produk berhasil ditambahkan ke keranjang.');
    }

    public function update(Request $request, $cartItemId)
    {
        $validator = Validator::make($request->all(), [
            'quantity' => 'required|integer|min:1',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator);
        }

        $cart = session()->get('cart');
        if (isset($cart[$cartItemId])) {
            $cart[$cartItemId]['quantity'] = $request->quantity;
            session()->put('cart', $cart);
        }

        return back()->with('message', 'Keranjang berhasil diperbarui.');
    }

    public function remove($cartItemId)
    {
        $cart = session()->get('cart');
        if (isset($cart[$cartItemId])) {
            unset($cart[$cartItemId]);
            session()->put('cart', $cart);
        }

        return back()->with('message', 'Produk berhasil dihapus dari keranjang.');
    }
}