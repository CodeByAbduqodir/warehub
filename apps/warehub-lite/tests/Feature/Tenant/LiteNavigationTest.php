<?php

declare(strict_types=1);

namespace Tests\Feature\Tenant;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;
use Warehub\Core\Models\Central\Tenant;
use Warehub\Core\Models\Tenant\IncomingDocument;
use Warehub\Core\Models\Tenant\Product;
use Warehub\Core\Models\Tenant\Stock;
use Warehub\Core\Models\Tenant\Warehouse;

class LiteNavigationTest extends TestCase
{
    use RefreshDatabase;

    private Tenant $tenant;

    private string $tenantDomain;

    private User $user;

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
        $this->warehouse = Warehouse::factory()->create();
        tenancy()->end();
    }

    public function test_legacy_lite_urls_redirect_to_available_workflows(): void
    {
        $this->actingAs($this->user)
            ->get("http://{$this->tenantDomain}/outgoing")
            ->assertRedirect('/outgoing/pos');

        $this->actingAs($this->user)
            ->get("http://{$this->tenantDomain}/inventory")
            ->assertRedirect('/stock');

        $this->actingAs($this->user)
            ->get("http://{$this->tenantDomain}/transfers")
            ->assertRedirect('/warehouses');

        $this->actingAs($this->user)
            ->get("http://{$this->tenantDomain}/outgoing/create")
            ->assertRedirect('/outgoing/pos');

        $this->actingAs($this->user)
            ->get("http://{$this->tenantDomain}/inventory/create")
            ->assertRedirect('/stock');

        $this->actingAs($this->user)
            ->get("http://{$this->tenantDomain}/reports/daily-chart")
            ->assertRedirect('/reports');

        $this->actingAs($this->user)
            ->get("http://{$this->tenantDomain}/settings/profile")
            ->assertRedirect('/');
    }

    public function test_dashboard_links_recent_incoming_documents_by_id(): void
    {
        tenancy()->initialize($this->tenant);
        $document = IncomingDocument::factory()->confirmed()->create([
            'number' => 'IN-000123',
            'warehouse_id' => $this->warehouse->id,
        ]);
        tenancy()->end();

        $this->actingAs($this->user)
            ->get("http://{$this->tenantDomain}/")
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('tenant/dashboard')
                ->where('recentOperations.0.id', $document->id)
                ->where('recentOperations.0.number', 'IN-000123')
            );
    }

    public function test_dashboard_includes_total_value_of_stock_at_retail_prices(): void
    {
        tenancy()->initialize($this->tenant);
        $product = Product::factory()->create(['retail_price' => 1200]);
        Stock::create([
            'product_id' => $product->id,
            'warehouse_id' => $this->warehouse->id,
            'quantity' => 3.5,
        ]);
        tenancy()->end();

        $this->actingAs($this->user)
            ->get("http://{$this->tenantDomain}/")
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('tenant/dashboard')
                ->where('kpi.totalStockValue', 4200)
            );
    }
}
