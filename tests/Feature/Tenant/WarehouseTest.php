<?php

declare(strict_types=1);

namespace Tests\Feature\Tenant;

use App\Models\Central\Tenant;
use App\Models\Tenant\Warehouse;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WarehouseTest extends TestCase
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

        $this->tenant->domains()->create([
            'domain' => 'testco.'.config('app.domain', 'warehub.test'),
        ]);

        $this->tenantDomain = 'testco.'.config('app.domain', 'warehub.test');

        tenancy()->initialize($this->tenant);
        $this->user = User::factory()->create();
        tenancy()->end();
    }

    public function test_warehouses_list_requires_auth(): void
    {
        $response = $this->get("http://{$this->tenantDomain}/warehouses");

        $response->assertRedirect('/login');
    }

    public function test_warehouses_list_is_accessible_to_authenticated_user(): void
    {
        $response = $this->actingAs($this->user)
            ->get("http://{$this->tenantDomain}/warehouses");

        $response->assertOk();
    }

    public function test_create_warehouse_page_is_accessible(): void
    {
        $response = $this->actingAs($this->user)
            ->get("http://{$this->tenantDomain}/warehouses/create");

        $response->assertOk();
    }

    public function test_authenticated_user_can_create_warehouse(): void
    {
        $response = $this->actingAs($this->user)
            ->post("http://{$this->tenantDomain}/warehouses", [
                'name' => 'Главный склад',
                'address' => 'г. Ташкент',
                'phone' => '+998901234567',
            ]);

        $response->assertRedirect('/warehouses');

        tenancy()->initialize($this->tenant);
        $this->assertDatabaseHas('warehouses', ['name' => 'Главный склад']);
        tenancy()->end();
    }

    public function test_warehouse_name_is_required(): void
    {
        $response = $this->actingAs($this->user)
            ->post("http://{$this->tenantDomain}/warehouses", [
                'address' => 'г. Ташкент',
            ]);

        $response->assertSessionHasErrors('name');
    }

    public function test_authenticated_user_can_update_warehouse(): void
    {
        tenancy()->initialize($this->tenant);
        $warehouse = Warehouse::factory()->create(['name' => 'Старый склад']);
        tenancy()->end();

        $response = $this->actingAs($this->user)
            ->patch("http://{$this->tenantDomain}/warehouses/{$warehouse->id}", [
                'name' => 'Новый склад',
            ]);

        $response->assertRedirect('/warehouses');

        tenancy()->initialize($this->tenant);
        $this->assertDatabaseHas('warehouses', ['id' => $warehouse->id, 'name' => 'Новый склад']);
        tenancy()->end();
    }

    public function test_authenticated_user_can_delete_warehouse(): void
    {
        tenancy()->initialize($this->tenant);
        $warehouse = Warehouse::factory()->create();
        tenancy()->end();

        $response = $this->actingAs($this->user)
            ->delete("http://{$this->tenantDomain}/warehouses/{$warehouse->id}");

        $response->assertRedirect('/warehouses');

        tenancy()->initialize($this->tenant);
        $this->assertDatabaseMissing('warehouses', ['id' => $warehouse->id]);
        tenancy()->end();
    }

    public function test_warehouse_belongs_to_current_tenant_only(): void
    {
        $otherTenant = Tenant::create([
            'subdomain' => 'othertenant',
            'name' => 'Other Co',
            'owner_email' => 'o@other.test',
            'status' => 'active',
        ]);

        tenancy()->initialize($otherTenant);
        $otherWarehouse = Warehouse::factory()->create();
        tenancy()->end();

        $response = $this->actingAs($this->user)
            ->get("http://{$this->tenantDomain}/warehouses/{$otherWarehouse->id}/edit");

        $response->assertStatus(404);
    }
}
