<?php

namespace App\Features\DesignTemplate;

use App\Features\Product\Product; // Tambahkan ini di atas
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class DesignTemplateController extends Controller
{
    public function upload(Request $request)
    {
        $validated = $request->validate([
            'file' => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'product_id' => 'nullable|exists:products,id_produk', // Validasi product_id
        ]);

        $originalName = pathinfo($request->file('file')->getClientOriginalName(), PATHINFO_FILENAME);
        $path = $request->file('file')->store('design-templates/files', 'public');

        $template = DesignTemplate::create([
            'name' => $originalName,
            'thumbnail_path' => $path,
            'file_path' => $path,
        ]);

        // Jika ada product_id, langsung tautkan relasinya
        if ($request->filled('product_id')) {
            $product = Product::find($request->product_id);
            $product->designTemplates()->attach($template->id);
        }

        return response()->json($template);
    }
}
