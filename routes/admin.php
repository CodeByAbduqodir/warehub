<?php

declare(strict_types=1);

use App\Http\Controllers\Admin\Auth\AuthenticatedSessionController;
use App\Http\Middleware\EnsureSuperAdmin;
use App\Models\Central\Tenant;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Super Admin Routes
|--------------------------------------------------------------------------
|
| Routes for the Super Admin panel at admin.warehub.test
|
*/

Route::middleware(['web'])->group(function () {
    Route::get('/login', [AuthenticatedSessionController::class, 'create'])->name('admin.login');
    Route::post('/login', [AuthenticatedSessionController::class, 'store'])->name('admin.login.store');
    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])->name('admin.logout');

    Route::middleware([EnsureSuperAdmin::class])->group(function () {
        Route::get('/', fn () => Inertia::render('admin/dashboard', [
            'tenantCount' => Tenant::count(),
        ]))->name('admin.dashboard');
        Route::get('/tenants', fn () => Inertia::render('admin/tenants/index', [
            'tenants' => Tenant::latest()->get(),
        ]))->name('admin.tenants.index');
    });
});
