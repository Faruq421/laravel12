<?php

use Illuminate\Support\Facades\Route;
use App\Features\DesignTemplate\DesignTemplateController;

Route::resource('design-templates', DesignTemplateController::class)->middleware(['auth', 'verified']);
