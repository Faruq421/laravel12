<?php

use App\Features\DesignTemplate\DesignTemplateController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'role:admin'])
    ->prefix('design-templates')
    ->name('design-templates.')
    ->group(function () {
        // Rute untuk mengunggah template baru
        Route::post('/upload', [DesignTemplateController::class, 'upload'])->name('upload');
    });
