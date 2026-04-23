<?php

declare(strict_types=1);

namespace Tests\Feature\Tenant;

use App\Models\Central\Tenant;
use App\Models\Tenant\Customer;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CustomerTest extends TestCase
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

    public function test_customers_list_requires_auth(): void
    {
        $response = $this->get("http://{$this->tenantDomain}/customers");
        $response->assertRedirect('/login');
    }

    public function test_customers_list_is_accessible(): void
    {
        $response = $this->actingAs($this->user)
            ->get("http://{$this->tenantDomain}/customers");
        $response->assertOk();
    }

    public function test_create_customer_page_is_accessible(): void
    {
        $response = $this->actingAs($this->user)
            ->get("http://{$this->tenantDomain}/customers/create");
        $response->assertOk();
    }

    public function test_authenticated_user_can_create_customer(): void
    {
        $response = $this->actingAs($this->user)
            ->post("http://{$this->tenantDomain}/customers", [
                'name' => 'Acme Corp',
                'phone' => '+998901234567',
                'email' => 'acme@example.com',
            ]);

        $response->assertRedirect('/customers');

        tenancy()->initialize($this->tenant);
        $this->assertDatabaseHas('customers', ['name' => 'Acme Corp', 'phone' => '+998901234567']);
        tenancy()->end();
    }

    public function test_customer_name_is_required(): void
    {
        $response = $this->actingAs($this->user)
            ->post("http://{$this->tenantDomain}/customers", ['phone' => '+998901234567']);
        $response->assertSessionHasErrors('name');
    }

    public function test_authenticated_user_can_update_customer(): void
    {
        tenancy()->initialize($this->tenant);
        $customer = Customer::factory()->create(['name' => 'Old Name']);
        tenancy()->end();

        $response = $this->actingAs($this->user)
            ->patch("http://{$this->tenantDomain}/customers/{$customer->id}", [
                'name' => 'New Name',
            ]);

        $response->assertRedirect('/customers');

        tenancy()->initialize($this->tenant);
        $this->assertDatabaseHas('customers', ['id' => $customer->id, 'name' => 'New Name']);
        tenancy()->end();
    }

    public function test_authenticated_user_can_delete_customer(): void
    {
        tenancy()->initialize($this->tenant);
        $customer = Customer::factory()->create();
        tenancy()->end();

        $response = $this->actingAs($this->user)
            ->delete("http://{$this->tenantDomain}/customers/{$customer->id}");

        $response->assertRedirect('/customers');

        tenancy()->initialize($this->tenant);
        $this->assertDatabaseMissing('customers', ['id' => $customer->id]);
        tenancy()->end();
    }

    public function test_customer_belongs_to_current_tenant_only(): void
    {
        $otherTenant = Tenant::create([
            'subdomain' => 'othertenant',
            'name' => 'Other Co',
            'owner_email' => 'o@other.test',
            'status' => 'active',
        ]);

        tenancy()->initialize($otherTenant);
        $otherCustomer = Customer::factory()->create();
        tenancy()->end();

        $response = $this->actingAs($this->user)
            ->get("http://{$this->tenantDomain}/customers/{$otherCustomer->id}/edit");

        $response->assertStatus(404);
    }
}
