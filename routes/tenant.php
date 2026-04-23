<?php

declare(strict_types=1);

use App\Http\Controllers\Tenant\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Tenant\CategoryController;
use App\Http\Controllers\Tenant\ProductController;
use App\Http\Controllers\Tenant\WarehouseController;
use App\Http\Middleware\EnsureTenant;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Stancl\Tenancy\Middleware\InitializeTenancyByDomain;
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
        InitializeTenancyByDomain::class,
        PreventAccessFromCentralDomains::class,
        'web',
    ])->group(function () {
        Route::get('/login', [AuthenticatedSessionController::class, 'create'])->name('tenant.login');
        Route::post('/login', [AuthenticatedSessionController::class, 'store'])->name('tenant.login.store');
        Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])->name('tenant.logout');

        Route::middleware(['auth', EnsureTenant::class])->group(function () {
            Route::get('/', fn () => Inertia::render('tenant/dashboard'))->name('tenant.dashboard');

            Route::resource('products', ProductController::class)->names([
                'index' => 'tenant.products.index',
                'create' => 'tenant.products.create',
                'store' => 'tenant.products.store',
                'edit' => 'tenant.products.edit',
                'update' => 'tenant.products.update',
                'destroy' => 'tenant.products.destroy',
            ])->except(['show']);

            Route::resource('warehouses', WarehouseController::class)->names([
                'index' => 'tenant.warehouses.index',
                'create' => 'tenant.warehouses.create',
                'store' => 'tenant.warehouses.store',
                'show' => 'tenant.warehouses.show',
                'edit' => 'tenant.warehouses.edit',
                'update' => 'tenant.warehouses.update',
                'destroy' => 'tenant.warehouses.destroy',
            ]);

            Route::post('categories', [CategoryController::class, 'store'])->name('tenant.categories.store');
        });
    });
