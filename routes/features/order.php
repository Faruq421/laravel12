<?php

use Illuminate\Support\Facades\Route;
use App\Features\Order\OrderController;
use App\Http\Controllers\Features\RajaOngkirController;

// RajaOngkir Shipping API Routes (public, no auth required for provinces/cities)
Route::prefix('shipping')->name('shipping.')->group(function () {
    Route::get('/provinces', [RajaOngkirController::class, 'getProvinces'])->name('provinces');
    Route::get('/cities/{provinceId}', [RajaOngkirController::class, 'getCities'])->name('cities');
    Route::post('/cost', [RajaOngkirController::class, 'calculateCost'])->name('cost');
    Route::post('/all-options', [RajaOngkirController::class, 'getAllShippingOptions'])->name('all-options');
});

Route::middleware(['auth'])->group(function () {
    Route::get('/checkout', [OrderController::class, 'create'])->name('checkout.create');
    Route::post('/checkout', [OrderController::class, 'store'])->name('checkout.store');
    // Rute BARU untuk halaman "Pesanan Saya" pelanggan
    Route::get('/my-orders', [OrderController::class, 'myOrders'])
        ->middleware(['auth']) // Pastikan hanya user terotentikasi
        ->name('orders.my');   // Kita beri nama 'orders.my' untuk Ziggy
});

Route::resource('orders', OrderController::class)->middleware(['auth', 'verified']);
