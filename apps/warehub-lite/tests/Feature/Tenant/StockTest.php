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

final class StockTest extends TestCase
{
    use RefreshDatabase;

    private Tenant $tenant;

    private string $tenantDomain;

    private User $user;

    private Product $product;

    private Warehouse $warehouse;

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
        $this->product = Product::factory()->create(['name' => 'Тестовый товар']);
        $this->warehouse = Warehouse::factory()->create(['name' => 'Основной склад']);
        tenancy()->end();
    }

    public function test_stock_create_page_includes_products_and_warehouses(): void
    {
        $this->actingAs($this->user)
            ->get("http://{$this->tenantDomain}/stock/create")
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('tenant/stock/create')
                ->has('products', 1)
                ->has('warehouses', 1)
            );
    }

    public function test_stock_store_creates_a_stock_position_and_accumulates_duplicates(): void
    {
        $payload = [
            'product_id' => $this->product->id,
            'warehouse_id' => $this->warehouse->id,
            'quantity' => 3.5,
        ];

        $this->actingAs($this->user)
            ->post("http://{$this->tenantDomain}/stock", $payload)
            ->assertRedirect('/stock');

        $this->actingAs($this->user)
            ->post("http://{$this->tenantDomain}/stock", [...$payload, 'quantity' => 1.5])
            ->assertRedirect('/stock');

        tenancy()->initialize($this->tenant);
        $stock = Stock::first();

        $this->assertNotNull($stock);
        $this->assertSame(5.0, (float) $stock->quantity);
        $this->assertSame(0, (int) $stock->reserved);
        tenancy()->end();
    }

    public function test_stock_search_finds_positions_by_product_sku(): void
    {
        tenancy()->initialize($this->tenant);
        $this->product->update(['sku' => 'TEA-001']);
        $otherProduct = Product::factory()->create(['sku' => 'COFFEE-001']);
        Stock::create([
            'product_id' => $this->product->id,
            'warehouse_id' => $this->warehouse->id,
            'quantity' => 5,
        ]);
        Stock::create([
            'product_id' => $otherProduct->id,
            'warehouse_id' => $this->warehouse->id,
            'quantity' => 3,
        ]);
        tenancy()->end();

        $this->actingAs($this->user)
            ->get("http://{$this->tenantDomain}/stock?search=TEA-001")
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('tenant/stock/index')
                ->has('stock.data', 1)
                ->where('stock.data.0.product.id', $this->product->id)
                ->where('filters.search', 'TEA-001')
            );
    }
}
