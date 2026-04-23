<?php

declare(strict_types=1);

namespace Tests\Feature\Tenant\Auth;

use App\Models\Central\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthenticatedSessionTest extends TestCase
{
    use RefreshDatabase;

    private Tenant $tenant;

    private string $tenantDomain;

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
    }

    public function test_login_screen_can_be_rendered(): void
    {
        $response = $this->get("http://{$this->tenantDomain}/login");

        $response->assertOk();
    }

    public function test_tenant_user_can_authenticate(): void
    {
        tenancy()->initialize($this->tenant);
        $user = User::factory()->create();
        tenancy()->end();

        $response = $this->post("http://{$this->tenantDomain}/login", [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $this->assertAuthenticatedAs($user, 'web');
        $response->assertRedirect('/');
    }

    public function test_user_from_another_tenant_cannot_authenticate(): void
    {
        $otherTenant = Tenant::create([
            'subdomain' => 'othertenant',
            'name' => 'Other Company',
            'owner_email' => 'owner@other.test',
            'status' => 'active',
        ]);

        tenancy()->initialize($otherTenant);
        $user = User::factory()->create();
        tenancy()->end();

        $this->post("http://{$this->tenantDomain}/login", [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $this->assertGuest('web');
    }

    public function test_user_cannot_authenticate_with_wrong_password(): void
    {
        tenancy()->initialize($this->tenant);
        $user = User::factory()->create();
        tenancy()->end();

        $this->post("http://{$this->tenantDomain}/login", [
            'email' => $user->email,
            'password' => 'wrong-password',
        ]);

        $this->assertGuest('web');
    }

    public function test_unauthenticated_request_redirects_to_login(): void
    {
        $response = $this->get("http://{$this->tenantDomain}/");

        $response->assertRedirect('/login');
    }

    public function test_authenticated_user_can_access_dashboard(): void
    {
        tenancy()->initialize($this->tenant);
        $user = User::factory()->create();
        tenancy()->end();

        $response = $this->actingAs($user)->get("http://{$this->tenantDomain}/");

        $response->assertOk();
    }

    public function test_tenant_user_can_logout(): void
    {
        tenancy()->initialize($this->tenant);
        $user = User::factory()->create();
        tenancy()->end();

        $response = $this->actingAs($user)
            ->post("http://{$this->tenantDomain}/logout");

        $this->assertGuest('web');
        $response->assertRedirect('/login');
    }

    public function test_suspended_tenant_returns_403(): void
    {
        $this->tenant->update(['status' => 'suspended']);

        tenancy()->initialize($this->tenant);
        $user = User::factory()->create();
        tenancy()->end();

        $response = $this->actingAs($user)->get("http://{$this->tenantDomain}/");

        $response->assertForbidden();
    }
}
