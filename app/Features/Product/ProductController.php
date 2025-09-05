<?php

namespace App\Features\Product;

use App\Http\Controllers\Controller;
use App\Features\Product\Category;
use App\Features\Product\ProductImage;
use App\Features\Product\Product; // <-- DISESUAIKAN: Path ke model Product
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::query()->with('category');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%")
                  ->orWhereHas('category', function ($catQuery) use ($search) {
                      $catQuery->where('name', 'like', "%{$search}%");
                  });
            });
        }

        $sortBy = $request->input('sort_by', 'created_at');
        $sortDir = $request->input('sort_dir', 'desc');
        $query->orderBy($sortBy, $sortDir);

        return Inertia::render('Features/Product/Index', [
            'items' => $query->paginate(10)->withQueryString(),
            'filters' => $request->only(['search', 'sort_by', 'sort_dir']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Features/Product/FormPage', [
            'categories' => Category::all(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'sku' => 'nullable|string|max:255|unique:products,sku',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'category_id' => 'required|exists:categories,id',
            'weight' => 'required|integer|min:0',
            'specifications' => 'required|json',
            'is_featured' => 'required|boolean',
            'is_published' => 'required|boolean',
            'images' => 'nullable|array', // Validasi untuk gambar baru
            'images.*' => 'image|mimes:jpeg,png,jpg,webp|max:2048', // Aturan untuk setiap file gambar
        ]);

        $product = Product::create($validated + ['slug' => Str::slug($validated['name'])]);

        // Proses unggah gambar jika ada
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $file) {
                $path = $file->store('products', 'public');
                $product->images()->create(['image_path' => $path]);
            }
        }

        // Redirect ke halaman index setelah produk berhasil dibuat
        return redirect()->route('products.index')->with('message', 'Produk baru berhasil ditambahkan.');
    }

    public function edit(Product $product)
    {
        return Inertia::render('Features/Product/FormPage', [
            'item' => $product->load('images'),
            'categories' => Category::all(),
        ]);
    }

    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'sku' => 'nullable|string|max:255|unique:products,sku,' . $product->id,
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'category_id' => 'required|exists:categories,id',
            'weight' => 'required|integer|min:0',
            'specifications' => 'required|json',
            'is_featured' => 'required|boolean',
            'is_published' => 'required|boolean',
            'images' => 'nullable|array',
            'images.*' => 'image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        $product->update($validated);

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $file) {
                $path = $file->store('products', 'public');
                $product->images()->create(['image_path' => $path]);
            }
        }

        return redirect()->route('products.index')->with('message', 'Produk berhasil diperbarui.');
    }

    public function destroy(Product $product)
    {
        foreach ($product->images as $image) {
            Storage::disk('public')->delete($image->image_path);
        }

        $product->delete();
        return redirect()->route('products.index')->with('message', 'Produk berhasil dihapus.');
    }

    public function destroyImage(ProductImage $image)
    {
        Storage::disk('public')->delete($image->image_path);
        $image->delete();

        return redirect()->back()->with('message', 'Gambar berhasil dihapus.');
    }
}

