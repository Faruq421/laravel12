<?php

use App\Http\Controllers\WelcomeController; 
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// UBAH ROUTE INI
Route::get('/', [WelcomeController::class, 'index'])->name('home');

Route::middleware(['auth', 'verified', 'role:admin'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

Route::middleware(['auth', 'verified', 'role:customer'])->group(function () {
    Route::get('/coba', function () {
        return Inertia::render('Customer/coba');
    })->name('coba');
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';

foreach (glob(base_path('routes/features/*.php')) as $route) {
    require $route;
}
