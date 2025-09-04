<?php

namespace App\Features\Product;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ProductController extends Controller
{
    // ... method index() Anda tidak perlu diubah ...
    public function index(Request $request)
    {
        $query = Product::with('category');

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('nama_produk', 'like', '%' . $request->search . '%')
                    ->orWhere('deskripsi', 'like', '%' . $request->search . '%')
                    ->orWhereHas('category', function ($categoryQuery) use ($request) {
                        $categoryQuery->where('name', 'like', '%' . $request->search . '%');
                    });
            });
        }

        if ($request->filled('sort_by') && $request->filled('sort_dir')) {
            $query->orderBy($request->sort_by, $request->sort_dir);
        } else {
            $query->latest('id_produk');
        }

        return Inertia::render('Features/Product/Index', [
            'items' => $query->paginate(10)->withQueryString(),
            'filters' => $request->only(['search', 'sort_by', 'sort_dir']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Features/Product/FormPage', [
            'categories' => Category::all(),
            'allAttributes' => Attribute::with('values')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validatedData = $this->validateProduct($request);

        DB::transaction(function () use ($request, $validatedData) {
            if ($request->hasFile('gambar')) {
                $path = $request->file('gambar')->store('products', 'public');
                $validatedData['gambar'] = $path;
            }

            $product = Product::create($validatedData);
            $this->syncAttributes($product, $request->input('attributes', []));
        });

        return redirect()->route('products.index')->with('message', 'Produk berhasil ditambahkan.');
    }

    public function edit(Product $product)
    {
        // Load relasi beserta data pivot 'price'
        $product->load('attributeValues.attribute');

        return Inertia::render('Features/Product/FormPage', [
            'item' => $product,
            'categories' => Category::all(),
            'allAttributes' => Attribute::with('values')->get(),
        ]);
    }

    public function update(Request $request, Product $product)
    {
        $validatedData = $this->validateProduct($request, $product->id_produk);

        DB::transaction(function () use ($request, $product, $validatedData) {
            if ($request->hasFile('gambar')) {
                if ($product->gambar) {
                    Storage::disk('public')->delete($product->gambar);
                }
                $path = $request->file('gambar')->store('products', 'public');
                $validatedData['gambar'] = $path;
            } else {
                unset($validatedData['gambar']);
            }

            $product->update($validatedData);
            $this->syncAttributes($product, $request->input('attributes', []));
        });

        return redirect()->route('products.index')->with('message', 'Produk berhasil diperbarui.');
    }

    public function destroy(Product $product)
    {
        if ($product->gambar) {
            Storage::disk('public')->delete($product->gambar);
        }

        $product->delete();
        return redirect()->route('products.index')->with('message', 'Produk berhasil dihapus.');
    }

    private function validateProduct(Request $request, $productId = null)
    {
        // Validasi baru yang mencakup harga pada opsi
        return $request->validate([
            'nama_produk' => 'required|string|max:255',
            'deskripsi' => 'required|string',
            'harga' => 'required|integer|min:0',
            'stok' => 'required|integer|min:0',
            'gambar' => ($productId ? 'nullable' : 'required') . '|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'category_id' => 'required|exists:categories,id',
            'status' => 'required|boolean',
            'attributes' => 'nullable|array',
            'attributes.*.name' => 'required_with:attributes|string|max:255',
            'attributes.*.options' => 'required_with:attributes|array|min:1',
            'attributes.*.options.*.value' => 'required_with:attributes|string|max:255',
            'attributes.*.options.*.price' => 'required_with:attributes|integer|min:0', // Validasi untuk harga
        ]);
    }

    /**
     * Helper function untuk sinkronisasi atribut, sekarang dengan harga.
     */
    private function syncAttributes(Product $product, array $attributesData)
    {
        $syncData = [];

        foreach ($attributesData as $attributeInfo) {
            $attribute = Attribute::firstOrCreate(['name' => $attributeInfo['name']]);

            foreach ($attributeInfo['options'] as $option) {
                $value = AttributeValue::firstOrCreate(
                    ['attribute_id' => $attribute->id, 'value' => $option['value']]
                );
                // Siapkan data untuk disinkronkan, termasuk harga dari pivot
                $syncData[$value->id] = ['price' => $option['price']];
            }
        }

        // Sync akan mengelola relasi dan data di tabel pivot
        $product->attributeValues()->sync($syncData);
    }
}
