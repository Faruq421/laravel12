<?php

use Illuminate\Support\Facades\Route;
use App\Features\Order\OrderController;

Route::middleware(['auth'])->group(function () {
    Route::get('/checkout', [OrderController::class, 'create'])->name('checkout.create');
    Route::post('/checkout', [OrderController::class, 'store'])->name('checkout.store');
});

Route::resource('orders', OrderController::class)->middleware(['auth', 'verified']);
