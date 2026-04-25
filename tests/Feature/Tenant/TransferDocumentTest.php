<?php

declare(strict_types=1);

namespace Tests\Feature\Tenant;

use App\Models\Central\Tenant;
use App\Models\Tenant\Product;
use App\Models\Tenant\Stock;
use App\Models\Tenant\TransferDocument;
use App\Models\Tenant\Warehouse;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TransferDocumentTest extends TestCase
{
    use RefreshDatabase;

    private Tenant $tenant;

    private string $tenantDomain;

    private User $user;

    private Warehouse $warehouseA;

    private Warehouse $warehouseB;

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
        $this->warehouseA = Warehouse::factory()->create(['name' => 'Склад А']);
        $this->warehouseB = Warehouse::factory()->create(['name' => 'Склад Б']);
        $this->product = Product::factory()->create();
        tenancy()->end();
    }

    private function seedStock(float $qty = 20.0): void
    {
        tenancy()->initialize($this->tenant);
        Stock::create([
            'product_id' => $this->product->id,
            'warehouse_id' => $this->warehouseA->id,
            'quantity' => $qty,
            'reserved' => 0,
        ]);
        tenancy()->end();
    }

    public function test_transfers_list_requires_auth(): void
    {
        $response = $this->get("http://{$this->tenantDomain}/transfers");

        $response->assertRedirect('/login');
    }

    public function test_transfers_list_is_accessible(): void
    {
        $response = $this->actingAs($this->user)
            ->get("http://{$this->tenantDomain}/transfers");

        $response->assertOk();
    }

    public function test_create_transfer_page_is_accessible(): void
    {
        $response = $this->actingAs($this->user)
            ->get("http://{$this->tenantDomain}/transfers/create");

        $response->assertOk();
    }

    public function test_can_create_transfer_document(): void
    {
        $response = $this->actingAs($this->user)
            ->post("http://{$this->tenantDomain}/transfers", [
                'date' => '2026-04-23',
                'from_warehouse_id' => $this->warehouseA->id,
                'to_warehouse_id' => $this->warehouseB->id,
                'items' => [
                    ['product_id' => $this->product->id, 'quantity' => 5],
                ],
            ]);

        $response->assertRedirect();

        tenancy()->initialize($this->tenant);
        $doc = TransferDocument::first();
        $this->assertNotNull($doc);
        $this->assertEquals('draft', $doc->status);
        $this->assertEquals($this->warehouseA->id, $doc->from_warehouse_id);
        $this->assertEquals($this->warehouseB->id, $doc->to_warehouse_id);
        $this->assertDatabaseHas('transfer_items', [
            'document_id' => $doc->id,
            'product_id' => $this->product->id,
            'quantity' => '5.000',
        ]);
        tenancy()->end();
    }

    public function test_same_warehouse_is_rejected(): void
    {
        $response = $this->actingAs($this->user)
            ->post("http://{$this->tenantDomain}/transfers", [
                'date' => '2026-04-23',
                'from_warehouse_id' => $this->warehouseA->id,
                'to_warehouse_id' => $this->warehouseA->id,
                'items' => [
                    ['product_id' => $this->product->id, 'quantity' => 5],
                ],
            ]);

        $response->assertSessionHasErrors('from_warehouse_id');
    }

    public function test_items_are_required(): void
    {
        $response = $this->actingAs($this->user)
            ->post("http://{$this->tenantDomain}/transfers", [
                'date' => '2026-04-23',
                'from_warehouse_id' => $this->warehouseA->id,
                'to_warehouse_id' => $this->warehouseB->id,
                'items' => [],
            ]);

        $response->assertSessionHasErrors('items');
    }

    public function test_show_page_is_accessible(): void
    {
        tenancy()->initialize($this->tenant);
        $doc = TransferDocument::create([
            'number' => 'TRF-2026-0001',
            'date' => '2026-04-23',
            'from_warehouse_id' => $this->warehouseA->id,
            'to_warehouse_id' => $this->warehouseB->id,
            'user_id' => $this->user->id,
            'status' => 'draft',
        ]);
        tenancy()->end();

        $response = $this->actingAs($this->user)
            ->get("http://{$this->tenantDomain}/transfers/{$doc->id}");

        $response->assertOk();
    }

    public function test_confirm_moves_stock_between_warehouses(): void
    {
        $this->seedStock(20.0);

        tenancy()->initialize($this->tenant);
        $doc = TransferDocument::create([
            'number' => 'TRF-2026-0001',
            'date' => '2026-04-23',
            'from_warehouse_id' => $this->warehouseA->id,
            'to_warehouse_id' => $this->warehouseB->id,
            'user_id' => $this->user->id,
            'status' => 'draft',
        ]);
        $doc->items()->create(['product_id' => $this->product->id, 'quantity' => 8]);
        tenancy()->end();

        $response = $this->actingAs($this->user)
            ->post("http://{$this->tenantDomain}/transfers/{$doc->id}/confirm");

        $response->assertRedirect('/transfers');

        tenancy()->initialize($this->tenant);
        $doc->refresh();
        $this->assertEquals('confirmed', $doc->status);

        $fromStock = Stock::where('product_id', $this->product->id)
            ->where('warehouse_id', $this->warehouseA->id)->first();
        $this->assertEquals('12.000', $fromStock->quantity);

        $toStock = Stock::where('product_id', $this->product->id)
            ->where('warehouse_id', $this->warehouseB->id)->first();
        $this->assertEquals('8.000', $toStock->quantity);
        tenancy()->end();
    }

    public function test_confirm_fails_if_insufficient_stock(): void
    {
        $this->seedStock(3.0);

        tenancy()->initialize($this->tenant);
        $doc = TransferDocument::create([
            'number' => 'TRF-2026-0001',
            'date' => '2026-04-23',
            'from_warehouse_id' => $this->warehouseA->id,
            'to_warehouse_id' => $this->warehouseB->id,
            'user_id' => $this->user->id,
            'status' => 'draft',
        ]);
        $doc->items()->create(['product_id' => $this->product->id, 'quantity' => 10]);
        tenancy()->end();

        $response = $this->actingAs($this->user)
            ->post("http://{$this->tenantDomain}/transfers/{$doc->id}/confirm");

        $response->assertSessionHasErrors('items');

        tenancy()->initialize($this->tenant);
        $doc->refresh();
        $this->assertEquals('draft', $doc->status);
        tenancy()->end();
    }

    public function test_confirm_is_idempotent(): void
    {
        tenancy()->initialize($this->tenant);
        $doc = TransferDocument::create([
            'number' => 'TRF-2026-0001',
            'date' => '2026-04-23',
            'from_warehouse_id' => $this->warehouseA->id,
            'to_warehouse_id' => $this->warehouseB->id,
            'user_id' => $this->user->id,
            'status' => 'confirmed',
            'confirmed_at' => now(),
        ]);
        tenancy()->end();

        $response = $this->actingAs($this->user)
            ->post("http://{$this->tenantDomain}/transfers/{$doc->id}/confirm");

        $response->assertRedirect('/transfers');
    }

    public function test_can_delete_draft_document(): void
    {
        tenancy()->initialize($this->tenant);
        $doc = TransferDocument::create([
            'number' => 'TRF-2026-0001',
            'date' => '2026-04-23',
            'from_warehouse_id' => $this->warehouseA->id,
            'to_warehouse_id' => $this->warehouseB->id,
            'user_id' => $this->user->id,
            'status' => 'draft',
        ]);
        tenancy()->end();

        $response = $this->actingAs($this->user)
            ->delete("http://{$this->tenantDomain}/transfers/{$doc->id}");

        $response->assertRedirect('/transfers');

        tenancy()->initialize($this->tenant);
        $this->assertSoftDeleted('transfer_documents', ['id' => $doc->id]);
        tenancy()->end();
    }

    public function test_cannot_delete_confirmed_document(): void
    {
        tenancy()->initialize($this->tenant);
        $doc = TransferDocument::create([
            'number' => 'TRF-2026-0001',
            'date' => '2026-04-23',
            'from_warehouse_id' => $this->warehouseA->id,
            'to_warehouse_id' => $this->warehouseB->id,
            'user_id' => $this->user->id,
            'status' => 'confirmed',
            'confirmed_at' => now(),
        ]);
        tenancy()->end();

        $this->actingAs($this->user)
            ->delete("http://{$this->tenantDomain}/transfers/{$doc->id}");

        tenancy()->initialize($this->tenant);
        $this->assertDatabaseHas('transfer_documents', ['id' => $doc->id, 'deleted_at' => null]);
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
        $otherWA = Warehouse::factory()->create();
        $otherWB = Warehouse::factory()->create();
        $otherDoc = TransferDocument::create([
            'number' => 'TRF-2026-0001',
            'date' => '2026-04-23',
            'from_warehouse_id' => $otherWA->id,
            'to_warehouse_id' => $otherWB->id,
            'user_id' => null,
            'status' => 'draft',
        ]);
        tenancy()->end();

        $response = $this->actingAs($this->user)
            ->get("http://{$this->tenantDomain}/transfers/{$otherDoc->id}");

        $response->assertStatus(404);
    }
}
