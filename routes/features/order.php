<?php

use Illuminate\Support\Facades\Route;
use App\Features\Order\OrderController;

Route::resource('orders', OrderController::class)->middleware(['auth', 'verified']);
