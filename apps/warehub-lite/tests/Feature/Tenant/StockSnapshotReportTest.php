<?php

declare(strict_types=1);

namespace Tests\Feature\Tenant;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;
use Warehub\Core\Models\Central\Tenant;
use Warehub\Core\Models\Tenant\Product;
use Warehub\Core\Models\Tenant\Stock;
use Warehub\Core\Models\Tenant\Warehouse;

final class StockSnapshotReportTest extends TestCase
{
    use RefreshDatabase;

    private Tenant $tenant;

    private string $tenantDomain;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->tenant = Tenant::create([
            'subdomain' => 'testco',
            'name' => 'Test Company',
            'owner_email' => 'owner@testco.test',
            'status' => 'active',
        ]);
        $this->tenantDomain = 'testco.'.config('app.domain', 'warehub.test');
        $this->tenant->domains()->create(['domain' => $this->tenantDomain]);

        tenancy()->initialize($this->tenant);
        $this->user = User::factory()->create();
        tenancy()->end();
    }

    public function test_stock_snapshot_separates_out_of_stock_and_low_stock_products(): void
    {
        tenancy()->initialize($this->tenant);

        $warehouse = Warehouse::factory()->create();
        $outOfStockProduct = Product::factory()->create(['name' => 'Нет в наличии']);
        $lowStockProduct = Product::factory()->create(['name' => 'Малый остаток']);
        $sufficientStockProduct = Product::factory()->create(['name' => 'Достаточный остаток']);

        Stock::create([
            'product_id' => $lowStockProduct->id,
            'warehouse_id' => $warehouse->id,
            'quantity' => 20,
        ]);
        Stock::create([
            'product_id' => $sufficientStockProduct->id,
            'warehouse_id' => $warehouse->id,
            'quantity' => 20.001,
        ]);

        tenancy()->end();

        $this->actingAs($this->user)
            ->get("http://{$this->tenantDomain}/reports/stock-snapshot")
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('tenant/reports/stock-snapshot')
                ->has('outOfStock', 1)
                ->where('outOfStock.0.id', $outOfStockProduct->id)
                ->has('lowStock', 1)
                ->where('lowStock.0.id', $lowStockProduct->id)
            );
    }
}
