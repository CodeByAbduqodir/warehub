<?php

declare(strict_types=1);

namespace Tests\Feature\Tenant;

use App\Models\Central\Tenant;
use App\Models\Tenant\OutgoingDocument;
use App\Models\Tenant\Product;
use App\Models\Tenant\Stock;
use App\Models\Tenant\Warehouse;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OutgoingDocumentTest extends TestCase
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
        $this->product = Product::factory()->create(['retail_price' => '80000.00', 'currency' => 'UZS']);
        tenancy()->end();
    }

    private function seedStock(float $quantity = 20.0): void
    {
        tenancy()->initialize($this->tenant);
        Stock::create([
            'product_id' => $this->product->id,
            'warehouse_id' => $this->warehouse->id,
            'zone_id' => null,
            'cell' => null,
            'quantity' => $quantity,
            'reserved' => 0,
        ]);
        tenancy()->end();
    }

    public function test_outgoing_list_requires_auth(): void
    {
        $response = $this->get("http://{$this->tenantDomain}/outgoing");
        $response->assertRedirect('/login');
    }

    public function test_outgoing_index_is_accessible(): void
    {
        $response = $this->actingAs($this->user)
            ->get("http://{$this->tenantDomain}/outgoing");
        $response->assertOk();
    }

    public function test_outgoing_create_is_accessible(): void
    {
        $response = $this->actingAs($this->user)
            ->get("http://{$this->tenantDomain}/outgoing/create");
        $response->assertOk();
    }

    public function test_pos_page_is_accessible(): void
    {
        $response = $this->actingAs($this->user)
            ->get("http://{$this->tenantDomain}/outgoing/pos");
        $response->assertOk();
    }

    public function test_can_create_outgoing_document(): void
    {
        $this->seedStock(20.0);

        $response = $this->actingAs($this->user)
            ->post("http://{$this->tenantDomain}/outgoing", [
                'date' => '2026-04-23',
                'warehouse_id' => $this->warehouse->id,
                'items' => [
                    ['product_id' => $this->product->id, 'quantity' => '5', 'retail_price' => '80000.00'],
                ],
            ]);

        $response->assertRedirect();

        tenancy()->initialize($this->tenant);
        $this->assertDatabaseHas('outgoing_documents', ['warehouse_id' => $this->warehouse->id, 'status' => 'draft']);
        $this->assertDatabaseHas('outgoing_items', ['product_id' => $this->product->id, 'quantity' => '5.000']);
        tenancy()->end();
    }

    public function test_warehouse_is_required(): void
    {
        $response = $this->actingAs($this->user)
            ->post("http://{$this->tenantDomain}/outgoing", [
                'date' => '2026-04-23',
                'items' => [
                    ['product_id' => $this->product->id, 'quantity' => '1', 'retail_price' => '80000.00'],
                ],
            ]);

        $response->assertSessionHasErrors('warehouse_id');
    }

    public function test_items_are_required(): void
    {
        $response = $this->actingAs($this->user)
            ->post("http://{$this->tenantDomain}/outgoing", [
                'date' => '2026-04-23',
                'warehouse_id' => $this->warehouse->id,
                'items' => [],
            ]);

        $response->assertSessionHasErrors('items');
    }

    public function test_confirm_decrements_stock(): void
    {
        $this->seedStock(20.0);

        tenancy()->initialize($this->tenant);
        $document = OutgoingDocument::factory()->create([
            'warehouse_id' => $this->warehouse->id,
            'status' => 'draft',
        ]);
        $document->items()->create([
            'product_id' => $this->product->id,
            'quantity' => '7.000',
            'retail_price' => '80000.00',
            'zone_id' => null,
        ]);
        tenancy()->end();

        $response = $this->actingAs($this->user)
            ->post("http://{$this->tenantDomain}/outgoing/{$document->id}/confirm");

        $response->assertRedirect();

        tenancy()->initialize($this->tenant);
        $document->refresh();
        $this->assertEquals('confirmed', $document->status);
        $stock = Stock::where('product_id', $this->product->id)
            ->where('warehouse_id', $this->warehouse->id)
            ->first();
        $this->assertNotNull($stock);
        $this->assertEquals('13.000', $stock->quantity);
        tenancy()->end();
    }

    public function test_confirm_fails_if_insufficient_stock(): void
    {
        $this->seedStock(3.0);

        tenancy()->initialize($this->tenant);
        $document = OutgoingDocument::factory()->create([
            'warehouse_id' => $this->warehouse->id,
            'status' => 'draft',
        ]);
        $document->items()->create([
            'product_id' => $this->product->id,
            'quantity' => '10.000',
            'retail_price' => '80000.00',
            'zone_id' => null,
        ]);
        tenancy()->end();

        $response = $this->actingAs($this->user)
            ->post("http://{$this->tenantDomain}/outgoing/{$document->id}/confirm");

        $response->assertSessionHasErrors('items');

        tenancy()->initialize($this->tenant);
        $document->refresh();
        $this->assertEquals('draft', $document->status);
        tenancy()->end();
    }

    public function test_confirm_is_idempotent(): void
    {
        tenancy()->initialize($this->tenant);
        $document = OutgoingDocument::factory()->confirmed()->create([
            'warehouse_id' => $this->warehouse->id,
        ]);
        tenancy()->end();

        $response = $this->actingAs($this->user)
            ->post("http://{$this->tenantDomain}/outgoing/{$document->id}/confirm");

        $response->assertRedirect();
    }

    public function test_can_delete_draft_document(): void
    {
        tenancy()->initialize($this->tenant);
        $document = OutgoingDocument::factory()->create([
            'warehouse_id' => $this->warehouse->id,
            'status' => 'draft',
        ]);
        tenancy()->end();

        $response = $this->actingAs($this->user)
            ->delete("http://{$this->tenantDomain}/outgoing/{$document->id}");

        $response->assertRedirect('/outgoing');

        tenancy()->initialize($this->tenant);
        $this->assertSoftDeleted('outgoing_documents', ['id' => $document->id]);
        tenancy()->end();
    }

    public function test_cannot_delete_confirmed_document(): void
    {
        tenancy()->initialize($this->tenant);
        $document = OutgoingDocument::factory()->confirmed()->create([
            'warehouse_id' => $this->warehouse->id,
        ]);
        tenancy()->end();

        $this->actingAs($this->user)
            ->delete("http://{$this->tenantDomain}/outgoing/{$document->id}");

        tenancy()->initialize($this->tenant);
        $this->assertDatabaseHas('outgoing_documents', ['id' => $document->id, 'deleted_at' => null]);
        tenancy()->end();
    }

    public function test_show_is_accessible(): void
    {
        tenancy()->initialize($this->tenant);
        $document = OutgoingDocument::factory()->create(['warehouse_id' => $this->warehouse->id]);
        tenancy()->end();

        $response = $this->actingAs($this->user)
            ->get("http://{$this->tenantDomain}/outgoing/{$document->id}");
        $response->assertOk();
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
        $otherDoc = OutgoingDocument::factory()->create(['warehouse_id' => $otherWarehouse->id]);
        tenancy()->end();

        $response = $this->actingAs($this->user)
            ->get("http://{$this->tenantDomain}/outgoing/{$otherDoc->id}");

        $response->assertStatus(404);
    }
}
