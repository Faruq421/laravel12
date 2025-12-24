<?php

use App\Http\Controllers\Features\PaymentController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Payment Routes
|--------------------------------------------------------------------------
|
| Routes for Midtrans payment integration.
|
*/

// Protected routes - require authentication
Route::middleware(['auth'])->group(function () {
    // Create Snap token for an order
    Route::post('/payment/{order}/create-token', [PaymentController::class, 'createSnapToken'])
        ->name('payment.createToken');
    
    // Get Midtrans client key for frontend
    Route::get('/payment/client-key', [PaymentController::class, 'getClientKey'])
        ->name('payment.clientKey');
});

// Webhook route - no authentication, no CSRF (handled in VerifyCsrfToken middleware)
Route::post('/api/payment/notification', [PaymentController::class, 'handleNotification'])
    ->name('payment.notification')
    ->withoutMiddleware([\Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class]);
