<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Super Admin Routes
|--------------------------------------------------------------------------
|
| Routes for the Super Admin panel at admin.warehub.test
|
*/

Route::middleware(['web'])->group(function () {
    Route::get('/login', fn () => 'Super Admin Login')->name('admin.login');

    Route::middleware(['auth:super_admin'])->group(function () {
        Route::get('/', fn () => 'Super Admin Dashboard')->name('admin.dashboard');
        Route::get('/tenants', fn () => 'Tenants List')->name('admin.tenants.index');
    });
});
