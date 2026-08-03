<?php

declare(strict_types=1);

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Warehub\Core\Models\Tenant\OutgoingDocument;
use Warehub\Core\Models\Tenant\OutgoingItem;
use Warehub\Core\Models\Tenant\Product;
use Warehub\Core\Models\Tenant\Stock;
use Warehub\Core\Models\Tenant\Warehouse;

class ReportController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('tenant/reports/index');
    }

    public function stockSnapshot(Request $request): Response
    {
        $warehouseId = $request->integer('warehouse_id') ?: null;

        $query = Stock::with(['product:id,name,sku,unit,category_id', 'product.category:id,name', 'warehouse:id,name'])
            ->when($warehouseId, fn ($q) => $q->where('warehouse_id', $warehouseId))
            ->where('quantity', '>', 0)
            ->orderByDesc('quantity');

        $stockAlerts = Product::query()
            ->select(['id', 'name', 'sku', 'unit'])
            ->withSum([
                'stock as available_quantity' => fn ($query) => $query
                    ->when($warehouseId, fn ($query) => $query->where('warehouse_id', $warehouseId)),
            ], 'quantity')
            ->orderBy('name')
            ->get();

        $outOfStock = $stockAlerts
            ->filter(fn (Product $product) => (float) ($product->available_quantity ?? 0) <= 0)
            ->values();

        $lowStock = $stockAlerts
            ->filter(fn (Product $product) => (float) ($product->available_quantity ?? 0) > 0 && (float) ($product->available_quantity ?? 0) <= 20)
            ->sortBy('available_quantity')
            ->values();

        return Inertia::render('tenant/reports/stock-snapshot', [
            'items' => $query->get(),
            'outOfStock' => $outOfStock,
            'lowStock' => $lowStock,
            'warehouses' => Warehouse::orderBy('name')->get(['id', 'name']),
            'filters' => ['warehouse_id' => $warehouseId],
        ]);
    }

    public function dailyIncome(Request $request): Response
    {
        $data = $request->validate([
            'date' => ['nullable', 'date'],
        ]);
        $date = $data['date'] ?? now()->toDateString();

        $documents = OutgoingDocument::query()
            ->with(['customer:id,name', 'items:id,document_id,quantity,retail_price'])
            ->whereDate('date', $date)
            ->where('status', 'confirmed')
            ->orderByDesc('confirmed_at')
            ->get()
            ->map(fn (OutgoingDocument $document): array => [
                'id' => $document->id,
                'number' => $document->number,
                'customer' => $document->customer?->name,
                'items_count' => $document->items->count(),
                'total_quantity' => $document->items->sum(fn (OutgoingItem $item): float => (float) $item->quantity),
                'total_amount' => $document->items->sum(fn (OutgoingItem $item): float => (float) $item->quantity * (float) $item->retail_price),
            ]);

        return Inertia::render('tenant/reports/daily-income', [
            'date' => $date,
            'documents' => $documents,
            'summary' => [
                'total_amount' => $documents->sum('total_amount'),
                'documents_count' => $documents->count(),
                'total_quantity' => $documents->sum('total_quantity'),
            ],
        ]);
    }

    public function backupExport(): StreamedResponse
    {
        $sales = OutgoingDocument::query()
            ->with([
                'customer:id,name',
                'items.product:id,sku,name,unit',
                'warehouse:id,name',
            ])
            ->where('status', 'confirmed')
            ->orderByDesc('date')
            ->orderByDesc('confirmed_at')
            ->get()
            ->flatMap(fn (OutgoingDocument $document) => $document->items->map(fn (OutgoingItem $item): array => [
                $document->date?->toDateString(),
                $document->number,
                $document->warehouse?->name ?? '—',
                $document->customer?->name ?? 'Розница',
                $item->product?->sku ?? '—',
                $item->product?->name ?? 'Удалённый товар',
                $item->product?->unit ?? '—',
                (float) $item->quantity,
                (float) $item->retail_price,
                (float) $item->quantity * (float) $item->retail_price,
            ]))
            ->all();

        $stock = Stock::with([
            'product:id,sku,barcode,name,unit,purchase_price,retail_price',
            'warehouse:id,name',
        ])
            ->orderBy('warehouse_id')
            ->orderBy('product_id')
            ->get()
            ->map(fn (Stock $item): array => [
                $item->warehouse?->name ?? '—',
                $item->product?->sku ?? '—',
                $item->product?->barcode ?? '—',
                $item->product?->name ?? 'Удалённый товар',
                $item->product?->unit ?? '—',
                (float) $item->quantity,
                (float) $item->reserved,
                $item->available(),
                (float) ($item->product?->purchase_price ?? 0),
                (float) ($item->product?->retail_price ?? 0),
                (float) $item->quantity * (float) ($item->product?->retail_price ?? 0),
            ])
            ->all();

        $spreadsheet = new Spreadsheet;
        $salesSheet = $spreadsheet->getActiveSheet();
        $salesSheet->setTitle('История продаж');
        $salesSheet->fromArray([
            ['Дата', 'Документ', 'Склад', 'Покупатель', 'SKU', 'Товар', 'Ед. изм.', 'Количество', 'Цена продажи, UZS', 'Сумма, UZS'],
            ...$sales,
        ]);
        $this->formatExportSheet($salesSheet, 'J', count($sales) + 1, ['H'], ['I', 'J']);

        $stockSheet = $spreadsheet->createSheet();
        $stockSheet->setTitle('Остатки на складе');
        $stockSheet->fromArray([
            ['Склад', 'SKU', 'Штрихкод', 'Товар', 'Ед. изм.', 'Остаток', 'Резерв', 'Доступно', 'Закупочная цена, UZS', 'Цена продажи, UZS', 'Стоимость остатков, UZS'],
            ...$stock,
        ]);
        $this->formatExportSheet($stockSheet, 'K', count($stock) + 1, ['F', 'G', 'H'], ['I', 'J', 'K']);

        $filename = 'warehub-backup-'.now()->format('Y-m-d-His').'.xlsx';

        return response()->streamDownload(function () use ($spreadsheet): void {
            (new Xlsx($spreadsheet))->save('php://output');
        }, $filename, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }

    public function topSelling(Request $request): Response
    {
        $tenantId = tenant('id');
        $from = $request->input('from', now()->subDays(30)->toDateString());
        $to = $request->input('to', now()->toDateString());
        $warehouseId = $request->integer('warehouse_id') ?: null;

        $items = DB::table('outgoing_items')
            ->join('outgoing_documents', 'outgoing_documents.id', '=', 'outgoing_items.document_id')
            ->join('products', 'products.id', '=', 'outgoing_items.product_id')
            ->where('outgoing_documents.tenant_id', $tenantId)
            ->where('products.tenant_id', $tenantId)
            ->where('outgoing_documents.status', 'confirmed')
            ->whereNull('outgoing_documents.deleted_at')
            ->whereBetween('outgoing_documents.date', [$from, $to])
            ->when($warehouseId, fn ($q) => $q->where('outgoing_documents.warehouse_id', $warehouseId))
            ->groupBy('outgoing_items.product_id', 'products.name', 'products.sku')
            ->select(
                'outgoing_items.product_id',
                'products.name',
                'products.sku',
                DB::raw('SUM(outgoing_items.quantity) as total_qty'),
                DB::raw('SUM(outgoing_items.quantity * outgoing_items.retail_price) as total_revenue')
            )
            ->orderByDesc('total_qty')
            ->limit(50)
            ->get();

        return Inertia::render('tenant/reports/top-selling', [
            'items' => $items,
            'warehouses' => Warehouse::orderBy('name')->get(['id', 'name']),
            'filters' => compact('from', 'to', 'warehouseId'),
        ]);
    }

    /**
     * @param  array<int, string>  $quantityColumns
     * @param  array<int, string>  $currencyColumns
     */
    private function formatExportSheet(Worksheet $sheet, string $lastColumn, int $lastRow, array $quantityColumns, array $currencyColumns): void
    {
        $sheet->freezePane('A2');
        $sheet->setAutoFilter("A1:{$lastColumn}{$lastRow}");
        $sheet->getStyle("A1:{$lastColumn}1")->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '0088CC']],
        ]);
        $sheet->getRowDimension(1)->setRowHeight(24);

        foreach ($quantityColumns as $column) {
            $sheet->getStyle("{$column}2:{$column}{$lastRow}")
                ->getNumberFormat()
                ->setFormatCode('#,##0.000');
        }

        foreach ($currencyColumns as $column) {
            $sheet->getStyle("{$column}2:{$column}{$lastRow}")
                ->getNumberFormat()
                ->setFormatCode('#,##0');
        }

        foreach (range('A', $lastColumn) as $column) {
            $sheet->getColumnDimension($column)->setAutoSize(true);
        }
    }
}
