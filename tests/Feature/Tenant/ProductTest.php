<?php

declare(strict_types=1);

namespace Tests\Feature\Tenant;

use App\Models\Central\Tenant;
use App\Models\Tenant\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductTest extends TestCase
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

    public function test_products_list_requires_auth(): void
    {
        $response = $this->get("http://{$this->tenantDomain}/products");

        $response->assertRedirect('/login');
    }

    public function test_products_list_is_accessible_to_authenticated_user(): void
    {
        $response = $this->actingAs($this->user)
            ->get("http://{$this->tenantDomain}/products");

        $response->assertOk();
    }

    public function test_create_product_page_is_accessible(): void
    {
        $response = $this->actingAs($this->user)
            ->get("http://{$this->tenantDomain}/products/create");

        $response->assertOk();
    }

    public function test_authenticated_user_can_create_product(): void
    {
        $response = $this->actingAs($this->user)
            ->post("http://{$this->tenantDomain}/products", [
                'name' => 'Test Product',
                'unit' => 'шт',
                'purchase_price' => '100.00',
                'retail_price' => '150.00',
                'currency' => 'UZS',
                'min_stock' => 5,
            ]);

        $response->assertRedirect('/products');

        tenancy()->initialize($this->tenant);
        $this->assertDatabaseHas('products', [
            'name' => 'Test Product',
            'unit' => 'шт',
            'retail_price' => '150.00',
        ]);
        tenancy()->end();
    }

    public function test_product_name_is_required(): void
    {
        $response = $this->actingAs($this->user)
            ->post("http://{$this->tenantDomain}/products", [
                'unit' => 'шт',
                'purchase_price' => '0',
                'retail_price' => '0',
                'currency' => 'UZS',
                'min_stock' => 0,
            ]);

        $response->assertSessionHasErrors('name');
    }

    public function test_authenticated_user_can_update_product(): void
    {
        tenancy()->initialize($this->tenant);
        $product = Product::factory()->create(['name' => 'Old Name']);
        tenancy()->end();

        $response = $this->actingAs($this->user)
            ->patch("http://{$this->tenantDomain}/products/{$product->id}", [
                'name' => 'New Name',
                'unit' => 'кг',
                'purchase_price' => '200.00',
                'retail_price' => '300.00',
                'currency' => 'UZS',
                'min_stock' => 0,
            ]);

        $response->assertRedirect('/products');

        tenancy()->initialize($this->tenant);
        $this->assertDatabaseHas('products', ['id' => $product->id, 'name' => 'New Name']);
        tenancy()->end();
    }

    public function test_authenticated_user_can_delete_product(): void
    {
        tenancy()->initialize($this->tenant);
        $product = Product::factory()->create();
        tenancy()->end();

        $response = $this->actingAs($this->user)
            ->delete("http://{$this->tenantDomain}/products/{$product->id}");

        $response->assertRedirect('/products');

        tenancy()->initialize($this->tenant);
        $this->assertDatabaseMissing('products', ['id' => $product->id]);
        tenancy()->end();
    }

    public function test_product_belongs_to_current_tenant_only(): void
    {
        $otherTenant = Tenant::create([
            'subdomain' => 'othertenant',
            'name' => 'Other Co',
            'owner_email' => 'o@other.test',
            'status' => 'active',
        ]);

        tenancy()->initialize($otherTenant);
        $otherProduct = Product::factory()->create();
        tenancy()->end();

        $response = $this->actingAs($this->user)
            ->get("http://{$this->tenantDomain}/products/{$otherProduct->id}/edit");

        $response->assertStatus(404);
    }
}
