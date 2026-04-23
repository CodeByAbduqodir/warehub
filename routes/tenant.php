<?php

declare(strict_types=1);

use App\Http\Controllers\Tenant\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Tenant\CategoryController;
use App\Http\Controllers\Tenant\CustomerController;
use App\Http\Controllers\Tenant\IncomingDocumentController;
use App\Http\Controllers\Tenant\InventoryDocumentController;
use App\Http\Controllers\Tenant\OutgoingDocumentController;
use App\Http\Controllers\Tenant\ProductController;
use App\Http\Controllers\Tenant\ReportController;
use App\Http\Controllers\Tenant\SupplierController;
use App\Http\Controllers\Tenant\TransferDocumentController;
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

            Route::resource('suppliers', SupplierController::class)->names([
                'index' => 'tenant.suppliers.index',
                'create' => 'tenant.suppliers.create',
                'store' => 'tenant.suppliers.store',
                'edit' => 'tenant.suppliers.edit',
                'update' => 'tenant.suppliers.update',
                'destroy' => 'tenant.suppliers.destroy',
            ])->except(['show']);

            Route::get('incoming', [IncomingDocumentController::class, 'index'])->name('tenant.incoming.index');
            Route::get('incoming/create', [IncomingDocumentController::class, 'create'])->name('tenant.incoming.create');
            Route::post('incoming', [IncomingDocumentController::class, 'store'])->name('tenant.incoming.store');
            Route::get('incoming/{incomingDocument}', [IncomingDocumentController::class, 'show'])->name('tenant.incoming.show');
            Route::post('incoming/{incomingDocument}/confirm', [IncomingDocumentController::class, 'confirm'])->name('tenant.incoming.confirm');
            Route::delete('incoming/{incomingDocument}', [IncomingDocumentController::class, 'destroy'])->name('tenant.incoming.destroy');

            Route::resource('customers', CustomerController::class)->names([
                'index' => 'tenant.customers.index',
                'create' => 'tenant.customers.create',
                'store' => 'tenant.customers.store',
                'edit' => 'tenant.customers.edit',
                'update' => 'tenant.customers.update',
                'destroy' => 'tenant.customers.destroy',
            ])->except(['show']);

            Route::get('outgoing/pos', [OutgoingDocumentController::class, 'pos'])->name('tenant.outgoing.pos');
            Route::get('outgoing', [OutgoingDocumentController::class, 'index'])->name('tenant.outgoing.index');
            Route::get('outgoing/create', [OutgoingDocumentController::class, 'create'])->name('tenant.outgoing.create');
            Route::post('outgoing', [OutgoingDocumentController::class, 'store'])->name('tenant.outgoing.store');
            Route::get('outgoing/{outgoingDocument}', [OutgoingDocumentController::class, 'show'])->name('tenant.outgoing.show');
            Route::post('outgoing/{outgoingDocument}/confirm', [OutgoingDocumentController::class, 'confirm'])->name('tenant.outgoing.confirm');
            Route::delete('outgoing/{outgoingDocument}', [OutgoingDocumentController::class, 'destroy'])->name('tenant.outgoing.destroy');

            // Inventory
            Route::get('inventory', [InventoryDocumentController::class, 'index'])->name('tenant.inventory.index');
            Route::get('inventory/create', [InventoryDocumentController::class, 'create'])->name('tenant.inventory.create');
            Route::post('inventory', [InventoryDocumentController::class, 'store'])->name('tenant.inventory.store');
            Route::get('inventory/{inventoryDocument}', [InventoryDocumentController::class, 'show'])->name('tenant.inventory.show');
            Route::patch('inventory/{inventoryDocument}/items/{inventoryItem}', [InventoryDocumentController::class, 'updateItem'])->name('tenant.inventory.updateItem');
            Route::post('inventory/{inventoryDocument}/confirm', [InventoryDocumentController::class, 'confirm'])->name('tenant.inventory.confirm');
            Route::delete('inventory/{inventoryDocument}', [InventoryDocumentController::class, 'destroy'])->name('tenant.inventory.destroy');

            // Transfers
            Route::get('transfers', [TransferDocumentController::class, 'index'])->name('tenant.transfers.index');
            Route::get('transfers/create', [TransferDocumentController::class, 'create'])->name('tenant.transfers.create');
            Route::post('transfers', [TransferDocumentController::class, 'store'])->name('tenant.transfers.store');
            Route::get('transfers/{transferDocument}', [TransferDocumentController::class, 'show'])->name('tenant.transfers.show');
            Route::post('transfers/{transferDocument}/confirm', [TransferDocumentController::class, 'confirm'])->name('tenant.transfers.confirm');
            Route::delete('transfers/{transferDocument}', [TransferDocumentController::class, 'destroy'])->name('tenant.transfers.destroy');

            // Reports
            Route::get('reports', [ReportController::class, 'index'])->name('tenant.reports.index');
            Route::get('reports/stock-snapshot', [ReportController::class, 'stockSnapshot'])->name('tenant.reports.stockSnapshot');
            Route::get('reports/movements', [ReportController::class, 'movements'])->name('tenant.reports.movements');
            Route::get('reports/top-selling', [ReportController::class, 'topSelling'])->name('tenant.reports.topSelling');
            Route::get('reports/top-profitable', [ReportController::class, 'topProfitable'])->name('tenant.reports.topProfitable');
            Route::get('reports/sales-by-category', [ReportController::class, 'salesByCategory'])->name('tenant.reports.salesByCategory');
            Route::get('reports/abc', [ReportController::class, 'abc'])->name('tenant.reports.abc');
            Route::get('reports/operators', [ReportController::class, 'operators'])->name('tenant.reports.operators');
            Route::get('reports/daily-chart', [ReportController::class, 'dailyChart'])->name('tenant.reports.dailyChart');
        });
    });
