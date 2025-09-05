<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

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

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';

foreach (glob(base_path('routes/features/*.php')) as $route) {
    require $route;
}
