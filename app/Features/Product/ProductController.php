<?php

namespace App\Features\Product;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index()
    {
        return Inertia::render('Features/Product/Index', [
            'items' => Product::latest()->paginate(10),
        ]);
    }

    public function create()
    {
        return Inertia::render('Features/Product/FormPage');
    }

    public function store(Request $request)
    {
        // Validation will be added by sync command
        Product::create($request->all());
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
        // Validation will be added by sync command
        $product->update($request->all());
        return redirect()->route('products.index')->with('message', 'Product updated successfully.');
    }

    public function destroy(Product $product)
    {
        $product->delete();
        return redirect()->route('products.index')->with('message', 'Product deleted successfully.');
    }
}
