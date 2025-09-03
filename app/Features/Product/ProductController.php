<?php

namespace App\Features\Product;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        // Ambil semua kolom dari model kecuali yang tersembunyi
        $model = new Product;
        $columns = array_diff($model->getConnection()->getSchemaBuilder()->getColumnListing($model->getTable()), $model->getHidden());

        $query = Product::query();

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

        return Inertia::render('Features/Product/Index', [
            // Kirim data yang sudah difilter dan diurutkan
            'items' => $query->paginate(10)->withQueryString(),
            // Kirim kembali filter yang sedang aktif ke view
            'filters' => $request->only(['search', 'sort_by', 'sort_dir']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Features/Product/FormPage');
    }

    public function store(Request $request)
    {
        // SYNC_VALIDATION_STORE_START
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:255'],
            'price' => ['required', 'numeric'],
            'stock' => ['required', 'string', 'max:255'],
            'is_published' => ['required', 'integer'],
        ]);
        Product::create($validated);
        // SYNC_VALIDATION_STORE_END
        return redirect()->route('products.index')->with('message', 'Product created successfully.');
    }

    public function edit(Product $product)
    {
        return Inertia::render('Features/Product/FormPage', [
            'item' => $product,
        ]);
    }

    public function update(Request $request, Product $product)
    {
        // SYNC_VALIDATION_UPDATE_START
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:255'],
            'price' => ['required', 'numeric'],
            'stock' => ['required', 'string', 'max:255'],
            'is_published' => ['required', 'integer'],
        ]);
        $product->update($validated);
        // SYNC_VALIDATION_UPDATE_END
        return redirect()->route('products.index')->with('message', 'Product updated successfully.');
    }

    public function destroy(Product $product)
    {
        $product->delete();
        return redirect()->route('products.index')->with('message', 'Product deleted successfully.');
    }
}
