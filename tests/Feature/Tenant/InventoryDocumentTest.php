<?php

declare(strict_types=1);

namespace Tests\Feature\Tenant;

use App\Models\Central\Tenant;
use App\Models\Tenant\InventoryDocument;
use App\Models\Tenant\InventoryItem;
use App\Models\Tenant\Product;
use App\Models\Tenant\Stock;
use App\Models\Tenant\Warehouse;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InventoryDocumentTest extends TestCase
{
    use RefreshDatabase;

    private Tenant $tenant;

    private string $tenantDomain;

    private User $user;

    private Warehouse $warehouse;

    private Product $product;

    protected function setUp(): void
    {
        parent::setUp();

        $this->tenant = Tenant::create([
            'subdomain' => 'testco',
            'name' => 'Test Company',
            'owner_email' => 'owner@testco.test',
            'status' => 'active',
        ]);

        $this->tenant->domains()->create([
            'domain' => 'testco.'.config('app.domain', 'warehub.test'),
        ]);

        $this->tenantDomain = 'testco.'.config('app.domain', 'warehub.test');

        tenancy()->initialize($this->tenant);
        $this->user = User::factory()->create();
        $this->warehouse = Warehouse::factory()->create();
        $this->product = Product::factory()->create();
        tenancy()->end();
    }

    private function seedStock(float $qty = 20.0): void
    {
        tenancy()->initialize($this->tenant);
        Stock::create([
            'product_id' => $this->product->id,
            'warehouse_id' => $this->warehouse->id,
            'quantity' => $qty,
            'reserved' => 0,
        ]);
        tenancy()->end();
    }

    public function test_inventory_list_requires_auth(): void
    {
        $response = $this->get("http://{$this->tenantDomain}/inventory");

        $response->assertRedirect('/login');
    }

    public function test_inventory_list_is_accessible(): void
    {
        $response = $this->actingAs($this->user)
            ->get("http://{$this->tenantDomain}/inventory");

        $response->assertOk();
    }

    public function test_create_inventory_page_is_accessible(): void
    {
        $response = $this->actingAs($this->user)
            ->get("http://{$this->tenantDomain}/inventory/create");

        $response->assertOk();
    }

    public function test_store_creates_inventory_document_with_stock_snapshot(): void
    {
        $this->seedStock(30.0);

        $response = $this->actingAs($this->user)
            ->post("http://{$this->tenantDomain}/inventory", [
                'date' => '2026-04-23',
                'warehouse_id' => $this->warehouse->id,
                'type' => 'planned',
            ]);

        $response->assertRedirect();

        tenancy()->initialize($this->tenant);
        $doc = InventoryDocument::first();
        $this->assertNotNull($doc);
        $this->assertEquals('in_progress', $doc->status);
        $this->assertDatabaseHas('inventory_items', [
            'document_id' => $doc->id,
            'product_id' => $this->product->id,
            'expected_qty' => '30.000',
        ]);
        tenancy()->end();
    }

    public function test_store_requires_warehouse(): void
    {
        $response = $this->actingAs($this->user)
            ->post("http://{$this->tenantDomain}/inventory", [
                'date' => '2026-04-23',
                'type' => 'planned',
            ]);

        $response->assertSessionHasErrors('warehouse_id');
    }

    public function test_store_requires_valid_type(): void
    {
        $response = $this->actingAs($this->user)
            ->post("http://{$this->tenantDomain}/inventory", [
                'date' => '2026-04-23',
                'warehouse_id' => $this->warehouse->id,
                'type' => 'invalid_type',
            ]);

        $response->assertSessionHasErrors('type');
    }

    public function test_show_page_is_accessible(): void
    {
        tenancy()->initialize($this->tenant);
        $doc = InventoryDocument::create([
            'number' => 'INV-2026-0001',
            'date' => '2026-04-23',
            'warehouse_id' => $this->warehouse->id,
            'user_id' => $this->user->id,
            'type' => 'planned',
            'status' => 'in_progress',
        ]);
        tenancy()->end();

        $response = $this->actingAs($this->user)
            ->get("http://{$this->tenantDomain}/inventory/{$doc->id}");

        $response->assertOk();
    }

    public function test_update_item_sets_actual_qty(): void
    {
        tenancy()->initialize($this->tenant);
        $doc = InventoryDocument::create([
            'number' => 'INV-2026-0001',
            'date' => '2026-04-23',
            'warehouse_id' => $this->warehouse->id,
            'user_id' => $this->user->id,
            'type' => 'planned',
            'status' => 'in_progress',
        ]);
        $item = InventoryItem::create([
            'document_id' => $doc->id,
            'product_id' => $this->product->id,
            'expected_qty' => 20.0,
            'actual_qty' => null,
        ]);
        tenancy()->end();

        $response = $this->actingAs($this->user)
            ->patch("http://{$this->tenantDomain}/inventory/{$doc->id}/items/{$item->id}", [
                'actual_qty' => 18,
            ]);

        $response->assertRedirect();

        tenancy()->initialize($this->tenant);
        $this->assertDatabaseHas('inventory_items', [
            'id' => $item->id,
            'actual_qty' => '18.000',
        ]);
        tenancy()->end();
    }

    public function test_confirm_adjusts_stock_for_discrepancy(): void
    {
        $this->seedStock(20.0);

        tenancy()->initialize($this->tenant);
        $doc = InventoryDocument::create([
            'number' => 'INV-2026-0001',
            'date' => '2026-04-23',
            'warehouse_id' => $this->warehouse->id,
            'user_id' => $this->user->id,
            'type' => 'planned',
            'status' => 'in_progress',
        ]);
        InventoryItem::create([
            'document_id' => $doc->id,
            'product_id' => $this->product->id,
            'expected_qty' => 20.0,
            'actual_qty' => 15.0,
        ]);
        tenancy()->end();

        $response = $this->actingAs($this->user)
            ->post("http://{$this->tenantDomain}/inventory/{$doc->id}/confirm");

        $response->assertRedirect('/inventory');

        tenancy()->initialize($this->tenant);
        $doc->refresh();
        $this->assertEquals('completed', $doc->status);
        $stock = Stock::where('product_id', $this->product->id)
            ->where('warehouse_id', $this->warehouse->id)
            ->first();
        $this->assertEquals('15.000', $stock->quantity);
        tenancy()->end();
    }

    public function test_confirm_ignores_items_without_actual_qty(): void
    {
        $this->seedStock(20.0);

        tenancy()->initialize($this->tenant);
        $doc = InventoryDocument::create([
            'number' => 'INV-2026-0001',
            'date' => '2026-04-23',
            'warehouse_id' => $this->warehouse->id,
            'user_id' => $this->user->id,
            'type' => 'planned',
            'status' => 'in_progress',
        ]);
        InventoryItem::create([
            'document_id' => $doc->id,
            'product_id' => $this->product->id,
            'expected_qty' => 20.0,
            'actual_qty' => null,
        ]);
        tenancy()->end();

        $this->actingAs($this->user)
            ->post("http://{$this->tenantDomain}/inventory/{$doc->id}/confirm");

        tenancy()->initialize($this->tenant);
        $stock = Stock::where('product_id', $this->product->id)
            ->where('warehouse_id', $this->warehouse->id)
            ->first();
        $this->assertEquals('20.000', $stock->quantity);
        tenancy()->end();
    }

    public function test_confirm_completed_document_is_idempotent(): void
    {
        tenancy()->initialize($this->tenant);
        $doc = InventoryDocument::create([
            'number' => 'INV-2026-0001',
            'date' => '2026-04-23',
            'warehouse_id' => $this->warehouse->id,
            'user_id' => $this->user->id,
            'type' => 'planned',
            'status' => 'completed',
            'confirmed_at' => now(),
        ]);
        tenancy()->end();

        $response = $this->actingAs($this->user)
            ->post("http://{$this->tenantDomain}/inventory/{$doc->id}/confirm");

        $response->assertRedirect('/inventory');
    }

    public function test_can_delete_in_progress_document(): void
    {
        tenancy()->initialize($this->tenant);
        $doc = InventoryDocument::create([
            'number' => 'INV-2026-0001',
            'date' => '2026-04-23',
            'warehouse_id' => $this->warehouse->id,
            'user_id' => $this->user->id,
            'type' => 'planned',
            'status' => 'in_progress',
        ]);
        tenancy()->end();

        $response = $this->actingAs($this->user)
            ->delete("http://{$this->tenantDomain}/inventory/{$doc->id}");

        $response->assertRedirect('/inventory');

        tenancy()->initialize($this->tenant);
        $this->assertSoftDeleted('inventory_documents', ['id' => $doc->id]);
        tenancy()->end();
    }

    public function test_cannot_delete_completed_document(): void
    {
        tenancy()->initialize($this->tenant);
        $doc = InventoryDocument::create([
            'number' => 'INV-2026-0001',
            'date' => '2026-04-23',
            'warehouse_id' => $this->warehouse->id,
            'user_id' => $this->user->id,
            'type' => 'planned',
            'status' => 'completed',
            'confirmed_at' => now(),
        ]);
        tenancy()->end();

        $this->actingAs($this->user)
            ->delete("http://{$this->tenantDomain}/inventory/{$doc->id}");

        tenancy()->initialize($this->tenant);
        $this->assertDatabaseHas('inventory_documents', ['id' => $doc->id, 'deleted_at' => null]);
        tenancy()->end();
    }

    public function test_document_belongs_to_current_tenant_only(): void
    {
        $otherTenant = Tenant::create([
            'subdomain' => 'othertenant',
            'name' => 'Other Co',
            'owner_email' => 'o@other.test',
            'status' => 'active',
        ]);

        tenancy()->initialize($otherTenant);
        $otherWarehouse = Warehouse::factory()->create();
        $otherDoc = InventoryDocument::create([
            'number' => 'INV-2026-0001',
            'date' => '2026-04-23',
            'warehouse_id' => $otherWarehouse->id,
            'user_id' => null,
            'type' => 'planned',
            'status' => 'in_progress',
        ]);
        tenancy()->end();

        $response = $this->actingAs($this->user)
            ->get("http://{$this->tenantDomain}/inventory/{$otherDoc->id}");

        $response->assertStatus(404);
    }
}
