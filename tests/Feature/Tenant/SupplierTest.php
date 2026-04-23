<?php

declare(strict_types=1);

namespace Tests\Feature\Tenant;

use App\Models\Central\Tenant;
use App\Models\Tenant\Supplier;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SupplierTest extends TestCase
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

    public function test_suppliers_list_requires_auth(): void
    {
        $response = $this->get("http://{$this->tenantDomain}/suppliers");

        $response->assertRedirect('/login');
    }

    public function test_suppliers_list_is_accessible(): void
    {
        $response = $this->actingAs($this->user)
            ->get("http://{$this->tenantDomain}/suppliers");

        $response->assertOk();
    }

    public function test_create_supplier_page_is_accessible(): void
    {
        $response = $this->actingAs($this->user)
            ->get("http://{$this->tenantDomain}/suppliers/create");

        $response->assertOk();
    }

    public function test_authenticated_user_can_create_supplier(): void
    {
        $response = $this->actingAs($this->user)
            ->post("http://{$this->tenantDomain}/suppliers", [
                'name' => 'ООО Тест Поставщик',
                'phone' => '+998901234567',
                'email' => 'supplier@test.uz',
            ]);

        $response->assertRedirect('/suppliers');

        tenancy()->initialize($this->tenant);
        $this->assertDatabaseHas('suppliers', [
            'name' => 'ООО Тест Поставщик',
            'email' => 'supplier@test.uz',
        ]);
        tenancy()->end();
    }

    public function test_supplier_name_is_required(): void
    {
        $response = $this->actingAs($this->user)
            ->post("http://{$this->tenantDomain}/suppliers", [
                'phone' => '+998901234567',
            ]);

        $response->assertSessionHasErrors('name');
    }

    public function test_authenticated_user_can_update_supplier(): void
    {
        tenancy()->initialize($this->tenant);
        $supplier = Supplier::factory()->create(['name' => 'Старое название']);
        tenancy()->end();

        $response = $this->actingAs($this->user)
            ->patch("http://{$this->tenantDomain}/suppliers/{$supplier->id}", [
                'name' => 'Новое название',
            ]);

        $response->assertRedirect('/suppliers');

        tenancy()->initialize($this->tenant);
        $this->assertDatabaseHas('suppliers', ['id' => $supplier->id, 'name' => 'Новое название']);
        tenancy()->end();
    }

    public function test_authenticated_user_can_delete_supplier(): void
    {
        tenancy()->initialize($this->tenant);
        $supplier = Supplier::factory()->create();
        tenancy()->end();

        $response = $this->actingAs($this->user)
            ->delete("http://{$this->tenantDomain}/suppliers/{$supplier->id}");

        $response->assertRedirect('/suppliers');

        tenancy()->initialize($this->tenant);
        $this->assertDatabaseMissing('suppliers', ['id' => $supplier->id]);
        tenancy()->end();
    }

    public function test_supplier_belongs_to_current_tenant_only(): void
    {
        $otherTenant = Tenant::create([
            'subdomain' => 'othertenant',
            'name' => 'Other Co',
            'owner_email' => 'o@other.test',
            'status' => 'active',
        ]);

        tenancy()->initialize($otherTenant);
        $otherSupplier = Supplier::factory()->create();
        tenancy()->end();

        $response = $this->actingAs($this->user)
            ->get("http://{$this->tenantDomain}/suppliers/{$otherSupplier->id}/edit");

        $response->assertStatus(404);
    }
}
