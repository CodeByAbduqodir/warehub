<?php

declare(strict_types=1);

namespace Tests\Feature\Tenant;

use App\Models\Central\Tenant;
use App\Models\Tenant\IncomingDocument;
use App\Models\Tenant\Product;
use App\Models\Tenant\Stock;
use App\Models\Tenant\Warehouse;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class IncomingDocumentTest extends TestCase
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
        $this->product = Product::factory()->create(['purchase_price' => '50000.00', 'currency' => 'UZS']);
        tenancy()->end();
    }

    public function test_incoming_list_requires_auth(): void
    {
        $response = $this->get("http://{$this->tenantDomain}/incoming");

        $response->assertRedirect('/login');
    }

    public function test_incoming_list_is_accessible(): void
    {
        $response = $this->actingAs($this->user)
            ->get("http://{$this->tenantDomain}/incoming");

        $response->assertOk();
    }

    public function test_create_incoming_page_is_accessible(): void
    {
        $response = $this->actingAs($this->user)
            ->get("http://{$this->tenantDomain}/incoming/create");

        $response->assertOk();
    }

    public function test_authenticated_user_can_create_incoming_document(): void
    {
        $response = $this->actingAs($this->user)
            ->post("http://{$this->tenantDomain}/incoming", [
                'date' => '2026-04-23',
                'warehouse_id' => $this->warehouse->id,
                'items' => [
                    [
                        'product_id' => $this->product->id,
                        'quantity' => 10,
                        'purchase_price' => '50000.00',
                    ],
                ],
            ]);

        $response->assertRedirect('/incoming');

        tenancy()->initialize($this->tenant);
        $this->assertDatabaseHas('incoming_documents', [
            'warehouse_id' => $this->warehouse->id,
            'status' => 'draft',
        ]);
        $this->assertDatabaseHas('incoming_items', [
            'product_id' => $this->product->id,
            'quantity' => '10.000',
        ]);
        tenancy()->end();
    }

    public function test_incoming_document_requires_items(): void
    {
        $response = $this->actingAs($this->user)
            ->post("http://{$this->tenantDomain}/incoming", [
                'date' => '2026-04-23',
                'warehouse_id' => $this->warehouse->id,
                'items' => [],
            ]);

        $response->assertSessionHasErrors('items');
    }

    public function test_incoming_document_requires_warehouse(): void
    {
        $response = $this->actingAs($this->user)
            ->post("http://{$this->tenantDomain}/incoming", [
                'date' => '2026-04-23',
                'items' => [
                    ['product_id' => $this->product->id, 'quantity' => 1, 'purchase_price' => '0'],
                ],
            ]);

        $response->assertSessionHasErrors('warehouse_id');
    }

    public function test_confirming_document_updates_stock(): void
    {
        tenancy()->initialize($this->tenant);
        $document = IncomingDocument::factory()->create([
            'warehouse_id' => $this->warehouse->id,
            'status' => 'draft',
        ]);
        $document->items()->create([
            'product_id' => $this->product->id,
            'quantity' => 15,
            'purchase_price' => '50000.00',
        ]);
        tenancy()->end();

        $response = $this->actingAs($this->user)
            ->post("http://{$this->tenantDomain}/incoming/{$document->id}/confirm");

        $response->assertRedirect('/incoming');

        tenancy()->initialize($this->tenant);
        $this->assertDatabaseHas('incoming_documents', [
            'id' => $document->id,
            'status' => 'confirmed',
        ]);
        $stock = Stock::where('product_id', $this->product->id)
            ->where('warehouse_id', $this->warehouse->id)
            ->first();
        $this->assertNotNull($stock);
        $this->assertEquals('15.000', $stock->quantity);
        tenancy()->end();
    }

    public function test_confirming_already_confirmed_document_is_idempotent(): void
    {
        tenancy()->initialize($this->tenant);
        $document = IncomingDocument::factory()->confirmed()->create([
            'warehouse_id' => $this->warehouse->id,
        ]);
        tenancy()->end();

        $response = $this->actingAs($this->user)
            ->post("http://{$this->tenantDomain}/incoming/{$document->id}/confirm");

        $response->assertRedirect('/incoming');
    }

    public function test_authenticated_user_can_delete_draft_document(): void
    {
        tenancy()->initialize($this->tenant);
        $document = IncomingDocument::factory()->create([
            'warehouse_id' => $this->warehouse->id,
            'status' => 'draft',
        ]);
        tenancy()->end();

        $response = $this->actingAs($this->user)
            ->delete("http://{$this->tenantDomain}/incoming/{$document->id}");

        $response->assertRedirect('/incoming');

        tenancy()->initialize($this->tenant);
        $this->assertSoftDeleted('incoming_documents', ['id' => $document->id]);
        tenancy()->end();
    }

    public function test_cannot_delete_confirmed_document(): void
    {
        tenancy()->initialize($this->tenant);
        $document = IncomingDocument::factory()->confirmed()->create([
            'warehouse_id' => $this->warehouse->id,
        ]);
        tenancy()->end();

        $this->actingAs($this->user)
            ->delete("http://{$this->tenantDomain}/incoming/{$document->id}");

        tenancy()->initialize($this->tenant);
        $this->assertDatabaseHas('incoming_documents', ['id' => $document->id, 'deleted_at' => null]);
        tenancy()->end();
    }

    public function test_document_show_page_is_accessible(): void
    {
        tenancy()->initialize($this->tenant);
        $document = IncomingDocument::factory()->create([
            'warehouse_id' => $this->warehouse->id,
        ]);
        tenancy()->end();

        $response = $this->actingAs($this->user)
            ->get("http://{$this->tenantDomain}/incoming/{$document->id}");

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
        $otherDocument = IncomingDocument::factory()->create([
            'warehouse_id' => $otherWarehouse->id,
        ]);
        tenancy()->end();

        $response = $this->actingAs($this->user)
            ->get("http://{$this->tenantDomain}/incoming/{$otherDocument->id}");

        $response->assertStatus(404);
    }
}
