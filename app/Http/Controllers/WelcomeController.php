<?php

namespace App\Http\Controllers;

use App\Features\Product\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WelcomeController extends Controller
{
    /**
     * Menampilkan halaman utama dengan data produk.
     */
    public function index()
    {
        // Mengambil 8 produk terbaru yang statusnya aktif
        // Eager load relasi 'category' untuk menghindari N+1 problem
        $products = Product::with('category')
            ->where('status', true)
            ->latest() // Mengurutkan dari yang terbaru
            ->take(8)  // Membatasi hanya 8 produk
            ->get();

        // Render komponen Inertia 'welcome' dan kirim data produk sebagai props
        return Inertia::render('welcome', [
            'products' => $products,
        ]);
    }
}
