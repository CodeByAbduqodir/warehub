<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Stancl\Tenancy\Middleware\InitializeTenancyBySubdomain;
use Stancl\Tenancy\Middleware\PreventAccessFromCentralDomains;

/*
|--------------------------------------------------------------------------
| Tenant Routes
|--------------------------------------------------------------------------
|
| Routes for tenant subdomains: {tenant}.warehub.test
|
*/

Route::domain('{tenant}.'.config('app.domain', 'warehub.test'))
    ->middleware([
        'web',
        InitializeTenancyBySubdomain::class,
        PreventAccessFromCentralDomains::class,
    ])->group(function () {
    Route::get('/login', fn () => 'Tenant Login')->name('tenant.login');

    Route::middleware(['auth'])->group(function () {
        Route::get('/', fn () => 'Tenant Dashboard — tenant: '.tenant('id'))->name('tenant.dashboard');
    });
});
