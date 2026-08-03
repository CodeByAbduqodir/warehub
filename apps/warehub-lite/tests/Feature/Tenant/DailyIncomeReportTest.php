<?php

declare(strict_types=1);

namespace Tests\Feature\Tenant;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;
use Warehub\Core\Models\Central\Tenant;
use Warehub\Core\Models\Tenant\OutgoingDocument;
use Warehub\Core\Models\Tenant\Product;
use Warehub\Core\Models\Tenant\Warehouse;

final class DailyIncomeReportTest extends TestCase
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
        $this->tenantDomain = 'testco.'.config('app.domain', 'warehub.test');
        $this->tenant->domains()->create(['domain' => $this->tenantDomain]);

        tenancy()->initialize($this->tenant);
        $this->user = User::factory()->create();
        tenancy()->end();
    }

    public function test_daily_income_includes_only_confirmed_sales_for_selected_date(): void
    {
        tenancy()->initialize($this->tenant);

        $warehouse = Warehouse::factory()->create();
        $firstProduct = Product::factory()->create();
        $secondProduct = Product::factory()->create();
        $selectedDate = '2026-08-01';

        $confirmedDocument = OutgoingDocument::factory()
            ->confirmed()
            ->create([
                'number' => 'OUT-2026-0001',
                'date' => $selectedDate,
                'warehouse_id' => $warehouse->id,
            ]);
        $confirmedDocument->items()->createMany([
            ['product_id' => $firstProduct->id, 'quantity' => 3, 'retail_price' => 1500],
            ['product_id' => $secondProduct->id, 'quantity' => 2, 'retail_price' => 1000],
        ]);

        OutgoingDocument::factory()->create([
            'date' => $selectedDate,
            'warehouse_id' => $warehouse->id,
            'status' => 'draft',
        ]);
        OutgoingDocument::factory()->confirmed()->create([
            'date' => '2026-08-02',
            'warehouse_id' => $warehouse->id,
        ]);

        tenancy()->end();

        $this->actingAs($this->user)
            ->get("http://{$this->tenantDomain}/reports/daily-income?date={$selectedDate}")
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('tenant/reports/daily-income')
                ->where('date', $selectedDate)
                ->has('documents', 1)
                ->where('documents.0.number', 'OUT-2026-0001')
                ->where('summary.documents_count', 1)
                ->where('summary.total_quantity', 5)
                ->where('summary.total_amount', 6500)
            );
    }
}
