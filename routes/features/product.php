<?php

use App\Features\Product\ProductController;
use Illuminate\Support\Facades\Route;

// Rute untuk admin (perlu login dan peran admin)
// DITEMPATKAN DI ATAS UNTUK PRIORITAS
Route::middleware(['auth', 'verified', 'role:admin'])->prefix('products')->name('products.')->group(function () {
    Route::get('/', [ProductController::class, 'index'])->name('index');
    Route::get('/create', [ProductController::class, 'create'])->name('create');
    Route::post('/', [ProductController::class, 'store'])->name('store');
    Route::get('/{product:id_produk}/edit', [ProductController::class, 'edit'])->name('edit');
    Route::put('/{product:id_produk}', [ProductController::class, 'update'])->name('update');
    Route::delete('/{product:id_produk}', [ProductController::class, 'destroy'])->name('destroy');
});

// Rute untuk publik (tidak perlu login) - DITEMPATKAN DI BAWAH SETELAH RUTE ADMIN
Route::get('/products/{product:slug}', [ProductController::class, 'show'])->name('products.show');
