<?php

declare(strict_types=1);

namespace Tests\Feature\Tenant;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PhpOffice\PhpSpreadsheet\IOFactory;
use Tests\TestCase;
use Warehub\Core\Models\Central\Tenant;
use Warehub\Core\Models\Tenant\OutgoingDocument;
use Warehub\Core\Models\Tenant\Product;
use Warehub\Core\Models\Tenant\Stock;
use Warehub\Core\Models\Tenant\Warehouse;

final class BackupExportTest extends TestCase
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

    public function test_backup_export_contains_sales_history_and_current_stock(): void
    {
        tenancy()->initialize($this->tenant);

        $warehouse = Warehouse::factory()->create(['name' => 'Основной склад']);
        $product = Product::factory()->create([
            'sku' => 'TEA-001',
            'name' => 'Зелёный чай',
            'purchase_price' => 1000,
            'retail_price' => 1500,
        ]);
        $document = OutgoingDocument::factory()->confirmed()->create([
            'number' => 'OUT-2026-0001',
            'date' => '2026-08-01',
            'warehouse_id' => $warehouse->id,
        ]);
        $document->items()->create([
            'product_id' => $product->id,
            'quantity' => 2,
            'retail_price' => 1500,
        ]);
        Stock::create([
            'product_id' => $product->id,
            'warehouse_id' => $warehouse->id,
            'quantity' => 7,
            'reserved' => 1,
        ]);

        tenancy()->end();

        $response = $this->actingAs($this->user)
            ->get("http://{$this->tenantDomain}/reports/backup-export")
            ->assertOk()
            ->assertDownload();

        $temporaryFile = tempnam(sys_get_temp_dir(), 'warehub-export-');
        $this->assertNotFalse($temporaryFile);
        file_put_contents($temporaryFile, $response->streamedContent());

        $workbook = IOFactory::load($temporaryFile);

        $this->assertSame(['История продаж', 'Остатки на складе'], $workbook->getSheetNames());
        $this->assertSame('OUT-2026-0001', $workbook->getSheetByName('История продаж')?->getCell('B2')->getValue());
        $this->assertSame('Зелёный чай', $workbook->getSheetByName('Остатки на складе')?->getCell('D2')->getValue());
        $this->assertSame(7.0, $workbook->getSheetByName('Остатки на складе')?->getCell('F2')->getValue());

        unlink($temporaryFile);
    }
}
