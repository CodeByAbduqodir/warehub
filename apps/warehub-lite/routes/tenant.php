<?php

declare(strict_types=1);

use App\Http\Controllers\Tenant\CategoryController;
use App\Http\Controllers\Tenant\DashboardController;
use App\Http\Controllers\Tenant\IncomingDocumentController;
use App\Http\Controllers\Tenant\OutgoingDocumentController;
use App\Http\Controllers\Tenant\ProductController;
use App\Http\Controllers\Tenant\ReportController;
use App\Http\Controllers\Tenant\StockController;
use App\Http\Controllers\Tenant\WarehouseController;
use App\Http\Middleware\EnsureTenant;
use Illuminate\Support\Facades\Route;
use Stancl\Tenancy\Middleware\InitializeTenancyByDomain;
use Stancl\Tenancy\Middleware\PreventAccessFromCentralDomains;

/*
|--------------------------------------------------------------------------
| Tenant Routes (warehub-lite)
|--------------------------------------------------------------------------
|
| Routes available in the small-shop edition: Dashboard, Products,
| Categories, Warehouses, Stock, Incoming (basic receipt
| flow), Outgoing (POS only), Reports (3 endpoints).
|
*/

Route::middleware([
    InitializeTenancyByDomain::class,
    PreventAccessFromCentralDomains::class,
    'web',
])->group(function () {
    Route::middleware(['auth', 'verified', EnsureTenant::class])->group(function () {
        Route::get('/', DashboardController::class)->name('tenant.dashboard');

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

        Route::resource('stock', StockController::class)->names([
            'index' => 'tenant.stock.index',
            'create' => 'tenant.stock.create',
            'store' => 'tenant.stock.store',
            'edit' => 'tenant.stock.edit',
            'update' => 'tenant.stock.update',
            'destroy' => 'tenant.stock.destroy',
        ])->except(['show']);

        // Incoming: simplified basic receipt flow (no supplier selector).
        Route::get('incoming', [IncomingDocumentController::class, 'index'])->name('tenant.incoming.index');
        Route::get('incoming/create', [IncomingDocumentController::class, 'create'])->name('tenant.incoming.create');
        Route::post('incoming', [IncomingDocumentController::class, 'store'])->name('tenant.incoming.store');
        Route::get('incoming/{incomingDocument}', [IncomingDocumentController::class, 'show'])->name('tenant.incoming.show');
        Route::post('incoming/{incomingDocument}/confirm', [IncomingDocumentController::class, 'confirm'])->name('tenant.incoming.confirm');
        Route::delete('incoming/{incomingDocument}', [IncomingDocumentController::class, 'destroy'])->name('tenant.incoming.destroy');

        // Outgoing: POS only.
        Route::get('outgoing/pos', [OutgoingDocumentController::class, 'pos'])->name('tenant.outgoing.pos');
        Route::post('outgoing/pos', [OutgoingDocumentController::class, 'posStore'])->name('tenant.outgoing.pos.store');
        Route::redirect('outgoing', '/outgoing/pos')->name('tenant.outgoing.index');
        Route::redirect('outgoing/{path}', '/outgoing/pos');

        // These workflows are available in WareHub Pro. Keep old Lite links from producing a 404.
        Route::redirect('inventory', '/stock');
        Route::redirect('inventory/{path}', '/stock');
        Route::redirect('transfers', '/warehouses');
        Route::redirect('transfers/{path}', '/warehouses');

        Route::redirect('settings', '/');
        Route::redirect('settings/{path}', '/');

        // Reports: stock snapshot, daily income, and top-selling.
        Route::get('reports', [ReportController::class, 'index'])->name('tenant.reports.index');
        Route::get('reports/stock-snapshot', [ReportController::class, 'stockSnapshot'])->name('tenant.reports.stockSnapshot');
        Route::get('reports/daily-income', [ReportController::class, 'dailyIncome'])->name('tenant.reports.dailyIncome');
        Route::get('reports/backup-export', [ReportController::class, 'backupExport'])->name('tenant.reports.backupExport');
        Route::get('reports/top-selling', [ReportController::class, 'topSelling'])->name('tenant.reports.topSelling');
        Route::redirect('reports/{report}', '/reports');
    });
});
