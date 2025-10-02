<?php

use App\Features\Product\ProductController;
use Illuminate\Support\Facades\Route;

// Rute untuk publik (tidak perlu login)
Route::get('/products/{product:slug}', [ProductController::class, 'show'])->name('products.show');

// Rute untuk admin (perlu login dan peran admin)
Route::middleware(['auth', 'verified', 'role:admin'])->group(function () {
    Route::resource('products', ProductController::class)->except(['show']);
});