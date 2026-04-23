<?php

declare(strict_types=1);

namespace Tests\Feature\Admin\Auth;

use App\Models\Central\SuperAdmin;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthenticatedSessionTest extends TestCase
{
    use RefreshDatabase;

    private string $adminDomain = 'admin.warehub.test';

    public function test_login_screen_can_be_rendered(): void
    {
        $response = $this->get("http://{$this->adminDomain}/login");

        $response->assertOk();
    }

    public function test_super_admin_can_authenticate(): void
    {
        $admin = SuperAdmin::factory()->create();

        $response = $this->post("http://{$this->adminDomain}/login", [
            'email' => $admin->email,
            'password' => 'password',
        ]);

        $this->assertAuthenticatedAs($admin, 'super_admin');
        $response->assertRedirect(route('admin.dashboard'));
    }

    public function test_super_admin_cannot_authenticate_with_wrong_password(): void
    {
        $admin = SuperAdmin::factory()->create();

        $this->post("http://{$this->adminDomain}/login", [
            'email' => $admin->email,
            'password' => 'wrong-password',
        ]);

        $this->assertGuest('super_admin');
    }

    public function test_super_admin_cannot_authenticate_with_unknown_email(): void
    {
        $response = $this->post("http://{$this->adminDomain}/login", [
            'email' => 'nobody@example.com',
            'password' => 'password',
        ]);

        $response->assertSessionHasErrors('email');
        $this->assertGuest('super_admin');
    }

    public function test_super_admin_can_logout(): void
    {
        $admin = SuperAdmin::factory()->create();

        $response = $this->actingAs($admin, 'super_admin')
            ->post("http://{$this->adminDomain}/logout");

        $this->assertGuest('super_admin');
        $response->assertRedirect(route('admin.login'));
    }

    public function test_unauthenticated_request_redirects_to_admin_login(): void
    {
        $response = $this->get("http://{$this->adminDomain}/");

        $response->assertRedirect(route('admin.login'));
    }
}
