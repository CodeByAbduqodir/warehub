<?php

use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

/*
|--------------------------------------------------------------------------
| Central Web Routes
|--------------------------------------------------------------------------
|
| Routes for the main domain: warehub.test
| Fortify auth routes are also registered for this domain.
|
*/

Route::domain(config('app.domain', 'warehub.test'))->group(function () {
    Route::inertia('/', 'welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ])->name('home');

    Route::middleware(['auth', 'verified'])->group(function () {
        Route::inertia('dashboard', 'dashboard')->name('dashboard');
    });

    require __DIR__.'/settings.php';
});
