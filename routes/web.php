<?php

use App\Features\Product\ProductController;
use App\Http\Controllers\Features\CartController;
use App\Http\Controllers\WelcomeController;
use Illuminate\Support\Facades\Route;

Route::get('/', [WelcomeController::class, 'index'])->name('welcome');

Route::get('/api/products/{product:slug}', [ProductController::class, 'quickView'])->name('products.quickView');
Route::get('/api/cart/{cartItemId}', [CartController::class, 'getItemDetails'])->name('cart.itemDetails');

// Rute untuk publik (tidak perlu login)

// Rute untuk Keranjang Belanja
Route::prefix('cart')->name('cart.')->group(function () {
    Route::get('/', [CartController::class, 'index'])->name('index');
    Route::post('/', [CartController::class, 'store'])->name('store');
    Route::patch('/{cartItemId}', [CartController::class, 'update'])->name('update');
    Route::delete('/{cartItemId}', [CartController::class, 'destroy'])->name('destroy');
});

// Rute untuk Halaman Toko "Produk & Jasa"
Route::get('/produk-jasa', [ProductController::class, 'shopIndex'])
     ->name('shop.index');

// Rute khusus Admin
Route::middleware(['auth', 'role:admin'])->group(function () {
    Route::get('/dashboard', function () {
        return \Inertia\Inertia::render('dashboard');
    })->name('dashboard');
});


require __DIR__.'/auth.php';
require __DIR__.'/settings.php';
