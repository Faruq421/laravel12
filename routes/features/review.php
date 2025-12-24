<?php

use Illuminate\Support\Facades\Route;
use App\Features\Review\ReviewController;

Route::resource('reviews', ReviewController::class)->middleware(['auth', 'verified']);
Route::get('/orders/{order}/review', [ReviewController::class, 'createForOrder'])
    ->name('reviews.create-for-order')
    ->middleware(['auth', 'verified']);
