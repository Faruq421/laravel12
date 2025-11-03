<?php

use Illuminate\Support\Facades\Route;
use App\Features\Order\OrderController;

Route::middleware(['auth'])->group(function () {
    Route::get('/checkout', [OrderController::class, 'create'])->name('checkout.create');
    Route::post('/checkout', [OrderController::class, 'store'])->name('checkout.store');
    // Rute BARU untuk halaman "Pesanan Saya" pelanggan
    Route::get('/my-orders', [OrderController::class, 'myOrders'])
        ->middleware(['auth']) // Pastikan hanya user terotentikasi
        ->name('orders.my');   // Kita beri nama 'orders.my' untuk Ziggy
});

Route::resource('orders', OrderController::class)->middleware(['auth', 'verified']);
