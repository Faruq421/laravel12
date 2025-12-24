<?php

namespace App\Http\Controllers\Features;

use App\Features\Product\Product;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class CartController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $cart = session('cart', ['items' => [], 'subtotal' => 0]);

        return Inertia::render('Features/Cart/Index', [
            'cartItems' => $cart['items'],
            'subtotal' => $cart['subtotal'],
        ]);
    }

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
            'note' => ['nullable', 'string', 'max:500'],
        ]);

        $product = Product::where('id_produk', $request->product_id)->firstOrFail();
        $cart = session()->get('cart', ['items' => [], 'subtotal' => 0]);

        $designData = $this->processDesignData($request);

        // Generate a unique key for each cart item based on product ID, variants, and design
        $optionsIdentifier = md5(serialize($request->variant) . serialize($designData) . $request->note);
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
                'variant' => $request->variant,
                'design' => $designData,
                'note' => $request->note,
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

        // Pastikan item yang akan diupdate ada
        if (!isset($cart['items'][$cartItemId])) {
            return redirect()->back()->with('error', 'Item tidak ditemukan di keranjang.');
        }

        // --- LOGIKA PENGHAPUSAN FILE LAMA ---
        $oldItem = $cart['items'][$cartItemId];
        $newDesignData = $this->processDesignData($request);

        // Cek jika item lama punya desain upload
        if (isset($oldItem['design']['type']) && $oldItem['design']['type'] === 'upload') {
            $isDesignChanged = serialize($oldItem['design']) !== serialize($newDesignData);
            
            // Jika desain berubah (menjadi template, upload baru, atau dihapus), hapus file lama.
            if ($isDesignChanged && isset($oldItem['design']['value'])) {
                Storage::delete('public/' . $oldItem['design']['value']);
            }
        }
        // --- AKHIR LOGIKA PENGHAPUSAN ---

        // Hapus item lama untuk digantikan dengan yang baru.
        // Ini adalah cara paling andal untuk memastikan semua data (termasuk ID jika opsi berubah) diperbarui.
        unset($cart['items'][$cartItemId]);

        $product = Product::findOrFail($request->product_id);
        $designData = $newDesignData; // Gunakan data desain yang sudah diproses

        // Buat ulang item dengan data baru (mirip dengan metode store)
        $optionsIdentifier = md5(serialize($request->variant) . serialize($designData));
        $newCartItemId = $product->id_produk . '-' . $optionsIdentifier;

        $variantDetails = $this->getVariantDetails($request->variant);

        $cart['items'][$newCartItemId] = [
            'id' => $newCartItemId,
            'product_id' => $product->id_produk,
            'name' => $product->nama_produk,
            'price' => $product->harga + $variantDetails['price_modifier'],
            'image' => $product->gambar_url,
            'quantity' => (int) $request->quantity,
            'variant' => $request->variant,
            'note' => $request->note,
            'design' => $designData,
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

    private function processDesignData(Request $request): ?array
    {
        // Debug logging
        Log::info('processDesignData called', [
            'has_design' => $request->has('design'),
            'design_type' => $request->input('design.type'),
            'design_value_type' => gettype($request->input('design.value')),
            'has_file' => $request->hasFile('design.value'),
            'all_files' => array_keys($request->allFiles()),
        ]);

        // If no design data is sent at all, do nothing.
        if (!$request->has('design') || !$request->input('design.type')) {
            Log::info('processDesignData: No design data sent');
            return null;
        }

        $designType = $request->input('design.type');
        $designValue = $request->input('design.value');

        // Case 1: New custom design upload
        if ($designType === 'upload' && $request->hasFile('design.value')) {
            $file = $request->file('design.value');
            Log::info('processDesignData: Uploading file', [
                'original_name' => $file->getClientOriginalName(),
                'size' => $file->getSize(),
                'mime' => $file->getMimeType(),
            ]);
            
            $path = $file->store('designs', 'public');
            
            Log::info('processDesignData: File stored', ['path' => $path]);
            
            return [
                'type' => 'upload',
                'value' => $path,
                'original_filename' => $file->getClientOriginalName(),
            ];
        }

        // Case 2: An existing design is being preserved during an update.
        // The value will be a string path, not a file.
        if ($designType === 'upload' && is_string($designValue)) {
            Log::info('processDesignData: Preserving existing upload path', ['path' => $designValue]);
            // We trust the frontend is sending back the data it received.
            return $request->input('design');
        }

        // Case 3: Template selection
        if ($designType === 'template' && !empty($designValue)) {
            Log::info('processDesignData: Template selected', ['template_id' => $designValue]);
            return [
                'type' => 'template',
                'value' => $designValue,
            ];
        }

        // Case 4: Fallback for invalid data
        Log::warning('processDesignData: Fallback - invalid design data', [
            'type' => $designType,
            'value' => $designValue,
        ]);
        return null;
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
