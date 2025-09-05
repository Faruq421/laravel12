<?php

use Illuminate\Support\Facades\Route;
use App\Features\Product\ProductController;

Route::resource('products', ProductController::class)->middleware(['auth', 'verified', 'role:admin']);
