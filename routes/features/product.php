<?php

use Illuminate\Support\Facades\Route;
use App\Features\Product\ProductController;

Route::resource('products', ProductController::class)->middleware(['auth', 'verified', 'role:admin']);

// Rute untuk menghapus gambar produk
Route::delete('/products/images/{image}', [App\Features\Product\ProductController::class, 'destroyImage'])
    ->name('products.images.destroy');
