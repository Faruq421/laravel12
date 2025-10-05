<?php

use App\Features\Product\ProductController;
use App\Http\Controllers\Features\Cart\CartController;
use App\Http\Controllers\WelcomeController;
use Illuminate\Support\Facades\Route;

Route::get('/', [WelcomeController::class, 'index'])->name('welcome');

// Rute untuk publik (tidak perlu login)

// Rute untuk Keranjang Belanja
Route::prefix('cart')->name('cart.')->group(function () {
    Route::post('/', [CartController::class, 'add'])->name('add');
    Route::patch('/{productId}', [CartController::class, 'update'])->name('update');
    Route::delete('/{productId}', [CartController::class, 'remove'])->name('remove');
});

// Rute khusus Admin
Route::middleware(['auth', 'role:admin'])->group(function () {
    Route::get('/dashboard', function () {
        return \Inertia\Inertia::render('dashboard');
    })->name('dashboard');
});


require __DIR__.'/auth.php';
require __DIR__.'/settings.php';
