<?php

namespace App\Features\Product;

use App\Http\Controllers\Controller;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function quickView(Product $product): JsonResponse
    {
        $product->load('category', 'attributeValues.attribute', 'designTemplates');
        return response()->json($product);
    }

    // ... method index() Anda tidak perlu diubah ...
    public function index(Request $request)
    {
        // Kode method index() Anda tetap sama
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

    public function show(string $slug)
    {
        $product = Product::where('slug', $slug)->firstOrFail();

        // Ambil produk terkait: 4 produk dari kategori yang sama, kecuali produk ini sendiri.
        $related_products = Product::with('category')
            ->where('category_id', $product->category_id)
            ->where('id_produk', '!=', $product->id_produk)
            ->inRandomOrder()
            ->limit(4)
            ->get();

        return Inertia::render('Features/Product/Show', [
            'product' => $product->load('category', 'attributeValues.attribute', 'designTemplates'),
            'related_products' => $related_products,
        ]);
    }

    /**
     * Menampilkan Halaman Toko "Produk & Jasa" untuk pelanggan.
     */
    public function shopIndex(Request $request)
    {
        // 1. Validasi input dari URL (query string)
        $request->validate([
            'sort' => 'in:newest,price-low,price-high',
            'category' => 'string|nullable|exists:categories,name',
            'min_price' => 'numeric|min:0',
            'max_price' => 'numeric|gte:min_price',
        ]);

        // 2. Mulai Query Builder
        $productsQuery = Product::query()->with('category');

        // 3. Terapkan Filter
        $productsQuery->when($request->category, function (Builder $query, $categoryName) {
            $query->whereHas('category', function (Builder $subQuery) use ($categoryName) {
                $subQuery->where('name', $categoryName);
            });
        });

        $productsQuery->when($request->min_price, function (Builder $query, $minPrice) {
            $query->where('harga', '>=', $minPrice);
        });

        $productsQuery->when($request->max_price, function (Builder $query, $maxPrice) {
            // Jangan filter jika max price adalah nilai maksimum
            if ($maxPrice < 1000000) {
                 $query->where('harga', '<=', $maxPrice);
            }
        });

        // 4. Terapkan Sorting
        if ($request->sort === 'price-low') {
            $productsQuery->orderBy('harga', 'asc');
        } elseif ($request->sort === 'price-high') {
            $productsQuery->orderBy('harga', 'desc');
        } else {
            $productsQuery->orderBy('created_at', 'desc'); // Default: 'newest'
        }

        // 5. Paginasi (Setelah semua filter & sort)
        // 'withQueryString' sangat penting agar filter tetap ada saat pindah halaman
        $products = $productsQuery->paginate(6)->withQueryString();

        // 6. Render Halaman Inertia
        return Inertia::render('Features/Product/ShopPage', [
            'products' => $products, // Ini adalah data paginasi dari Laravel
            'filters' => $request->only(['sort', 'category', 'min_price', 'max_price']),
            'categories' => Category::select('name')->distinct()->get()->pluck('name'),
        ]);
    }

    public function create()
    {
        return Inertia::render('Features/Product/FormPage', [
            'categories' => Category::all(),
            'allAttributes' => Attribute::with('values')->get(),
            'designTemplates' => \App\Features\DesignTemplate\DesignTemplate::all(),
        ]);
    }

    public function store(Request $request)
    {
        $validatedData = $this->validateProduct($request);

        $product = DB::transaction(function () use ($request, $validatedData) {
            if ($request->hasFile('gambar')) {
                $path = $request->file('gambar')->store('products', 'public');
                $validatedData['gambar'] = $path;
            }
            $product = Product::create($validatedData);
            $this->syncAttributes($product, $request->input('attributes', []));

            // Ekstrak ID dari array of objects
            $templateIds = collect($request->input('design_templates', []))->pluck('id')->all();
            $product->designTemplates()->sync($templateIds);

            return $product;
        });

        return redirect()->route('products.index')->with('message', 'Produk berhasil ditambahkan.');
    }

    public function edit(Product $product)
    {
        $product->load('attributeValues.attribute', 'designTemplates');
        return Inertia::render('Features/Product/FormPage', [
            'item' => $product,
            'categories' => Category::all(),
            'allAttributes' => Attribute::with('values')->get(),
            'designTemplates' => \App\Features\DesignTemplate\DesignTemplate::all(),
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

            // Ekstrak ID dari array of objects
            $templateIds = collect($request->input('design_templates', []))->pluck('id')->all();
            $product->designTemplates()->sync($templateIds);
        });

        return redirect()->route('products.index')->with('message', 'Produk berhasil diperbarui.');
    }

    public function destroy(Product $product)
    {
        DB::transaction(function () use ($product) {
            if ($product->gambar) {
                Storage::disk('public')->delete($product->gambar);
            }
            // Dapatkan ID dari nilai-nilai yang akan dihapus bersama produk
            $detachedValueIds = $product->attributeValues()->pluck('attribute_values.id');
            // Hapus produk, yang juga akan melepaskan relasi di tabel pivot
            $product->delete();
            // Jalankan pembersihan untuk nilai-nilai yang baru saja dilepaskan
            $this->cleanupAttributes($detachedValueIds);
        });

        return redirect()->route('products.index')->with('message', 'Produk berhasil dihapus.');
    }

    private function validateProduct(Request $request, $productId = null)
    {
        return $request->validate([
            'nama_produk' => 'required|string|max:255',
            'deskripsi' => 'required|string',
            'harga' => 'required|integer|min:0',
            'stok' => 'required|integer|min:0',
            'gambar' => ($productId ? 'nullable' : 'required') . '|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'category_id' => 'required|exists:categories,id',
            'status' => 'required|boolean',
            'allow_custom_design' => 'required|boolean',
            'enable_design_feature' => 'required|boolean',
            'design_templates' => 'nullable|array',
            'design_templates.*.id' => 'exists:design_templates,id',
            'attributes' => 'nullable|array',
            'attributes.*.name' => 'required_with:attributes|string|max:255',
            'attributes.*.options' => 'required_with:attributes|array|min:1',
            'attributes.*.options.*.value' => 'required_with:attributes|string|max:255',
            'attributes.*.options.*.price' => 'required_with:attributes|integer|min:0',
        ]);
    }

    private function syncAttributes(Product $product, array $attributesData)
    {
        // === LOGIKA PEMBERSIHAN DIMULAI DI SINI ===
        // 1. Dapatkan ID nilai atribut yang saat ini terpasang pada produk SEBELUM sinkronisasi.
        $oldValueIds = $product->attributeValues()->pluck('attribute_values.id');

        $syncData = [];
        $newValueIds = collect(); // Kumpulan untuk ID nilai atribut yang baru

        foreach ($attributesData as $attributeInfo) {
            $attribute = Attribute::firstOrCreate(['name' => $attributeInfo['name']]);
            foreach ($attributeInfo['options'] as $option) {
                $value = AttributeValue::firstOrCreate(
                    ['attribute_id' => $attribute->id, 'value' => $option['value']]
                );
                $syncData[$value->id] = ['price' => $option['price']];
                $newValueIds->push($value->id); // Tambahkan ID baru ke kumpulan
            }
        }

        $product->attributeValues()->sync($syncData);

        // 2. Tentukan ID mana yang dilepas (ada di koleksi lama, tapi tidak di yang baru)
        $detachedValueIds = $oldValueIds->diff($newValueIds);

        // 3. Jalankan fungsi pembersihan untuk ID yang baru saja dilepas
        $this->cleanupAttributes($detachedValueIds);
    }

    /**
     * Fungsi baru untuk membersihkan atribut dan nilai yang tidak terpakai (yatim piatu).
     */
    private function cleanupAttributes($valueIds)
    {
        if ($valueIds->isEmpty()) {
            return;
        }

        foreach ($valueIds as $valueId) {
            // Periksa apakah nilai ini masih digunakan oleh produk lain.
            $isUsed = DB::table('product_attribute_value')->where('attribute_value_id', $valueId)->exists();

            // Jika TIDAK digunakan lagi, hapus.
            if (!$isUsed) {
                $value = AttributeValue::find($valueId);
                if ($value) {
                    $attributeId = $value->attribute_id;
                    $value->delete();

                    // Setelah menghapus nilai, periksa induk atributnya.
                    $hasOtherValues = AttributeValue::where('attribute_id', $attributeId)->exists();

                    // Jika induk atribut sudah tidak punya nilai lain, hapus induknya juga.
                    if (!$hasOtherValues) {
                        Attribute::find($attributeId)->delete();
                    }
                }
            }
        }
    }
}
