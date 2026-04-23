<?php

declare(strict_types=1);

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\Product;
use App\Models\Tenant\Stock;
use App\Models\Tenant\Warehouse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

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

        return Inertia::render('tenant/reports/stock-snapshot', [
            'items' => $query->get(),
            'warehouses' => Warehouse::orderBy('name')->get(['id', 'name']),
            'filters' => ['warehouse_id' => $warehouseId],
        ]);
    }

    public function movements(Request $request): Response
    {
        $productId = $request->integer('product_id') ?: null;
        $from = $request->input('from', now()->subDays(30)->toDateString());
        $to = $request->input('to', now()->toDateString());

        $incoming = [];
        $outgoing = [];

        if ($productId) {
            $incoming = DB::table('incoming_items')
                ->join('incoming_documents', 'incoming_documents.id', '=', 'incoming_items.document_id')
                ->where('incoming_items.product_id', $productId)
                ->where('incoming_documents.status', 'confirmed')
                ->whereBetween('incoming_documents.date', [$from, $to])
                ->select(
                    'incoming_documents.date',
                    'incoming_documents.number',
                    DB::raw("'in' as type"),
                    'incoming_items.quantity',
                    'incoming_items.purchase_price as price'
                )
                ->get();

            $outgoing = DB::table('outgoing_items')
                ->join('outgoing_documents', 'outgoing_documents.id', '=', 'outgoing_items.document_id')
                ->where('outgoing_items.product_id', $productId)
                ->where('outgoing_documents.status', 'confirmed')
                ->whereNull('outgoing_documents.deleted_at')
                ->whereBetween('outgoing_documents.date', [$from, $to])
                ->select(
                    'outgoing_documents.date',
                    'outgoing_documents.number',
                    DB::raw("'out' as type"),
                    'outgoing_items.quantity',
                    'outgoing_items.retail_price as price'
                )
                ->get();
        }

        return Inertia::render('tenant/reports/movements', [
            'movements' => collect($incoming)->concat($outgoing)->sortBy('date')->values(),
            'products' => Product::orderBy('name')->get(['id', 'name', 'sku']),
            'filters' => compact('productId', 'from', 'to'),
        ]);
    }

    public function topSelling(Request $request): Response
    {
        $from = $request->input('from', now()->subDays(30)->toDateString());
        $to = $request->input('to', now()->toDateString());
        $warehouseId = $request->integer('warehouse_id') ?: null;

        $items = DB::table('outgoing_items')
            ->join('outgoing_documents', 'outgoing_documents.id', '=', 'outgoing_items.document_id')
            ->join('products', 'products.id', '=', 'outgoing_items.product_id')
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

    public function topProfitable(Request $request): Response
    {
        $from = $request->input('from', now()->subDays(30)->toDateString());
        $to = $request->input('to', now()->toDateString());

        $items = DB::table('outgoing_items')
            ->join('outgoing_documents', 'outgoing_documents.id', '=', 'outgoing_items.document_id')
            ->join('products', 'products.id', '=', 'outgoing_items.product_id')
            ->where('outgoing_documents.status', 'confirmed')
            ->whereNull('outgoing_documents.deleted_at')
            ->whereBetween('outgoing_documents.date', [$from, $to])
            ->groupBy('outgoing_items.product_id', 'products.name', 'products.sku', 'products.purchase_price')
            ->select(
                'outgoing_items.product_id',
                'products.name',
                'products.sku',
                DB::raw('SUM(outgoing_items.quantity) as total_qty'),
                DB::raw('SUM(outgoing_items.quantity * outgoing_items.retail_price) as revenue'),
                DB::raw('SUM(outgoing_items.quantity * products.purchase_price) as cost'),
                DB::raw('SUM(outgoing_items.quantity * (outgoing_items.retail_price - products.purchase_price)) as profit')
            )
            ->orderByDesc('profit')
            ->limit(50)
            ->get();

        return Inertia::render('tenant/reports/top-profitable', [
            'items' => $items,
            'filters' => compact('from', 'to'),
        ]);
    }

    public function salesByCategory(Request $request): Response
    {
        $from = $request->input('from', now()->subDays(30)->toDateString());
        $to = $request->input('to', now()->toDateString());

        $data = DB::table('outgoing_items')
            ->join('outgoing_documents', 'outgoing_documents.id', '=', 'outgoing_items.document_id')
            ->join('products', 'products.id', '=', 'outgoing_items.product_id')
            ->leftJoin('categories', 'categories.id', '=', 'products.category_id')
            ->where('outgoing_documents.status', 'confirmed')
            ->whereNull('outgoing_documents.deleted_at')
            ->whereBetween('outgoing_documents.date', [$from, $to])
            ->groupBy('products.category_id', 'categories.name')
            ->select(
                DB::raw("COALESCE(categories.name, 'Без категории') as category"),
                DB::raw('SUM(outgoing_items.quantity * outgoing_items.retail_price) as revenue'),
                DB::raw('SUM(outgoing_items.quantity) as qty')
            )
            ->orderByDesc('revenue')
            ->get();

        return Inertia::render('tenant/reports/sales-by-category', [
            'data' => $data,
            'filters' => compact('from', 'to'),
        ]);
    }

    public function abc(Request $request): Response
    {
        $from = $request->input('from', now()->subDays(90)->toDateString());
        $to = $request->input('to', now()->toDateString());

        $items = DB::table('outgoing_items')
            ->join('outgoing_documents', 'outgoing_documents.id', '=', 'outgoing_items.document_id')
            ->join('products', 'products.id', '=', 'outgoing_items.product_id')
            ->where('outgoing_documents.status', 'confirmed')
            ->whereNull('outgoing_documents.deleted_at')
            ->whereBetween('outgoing_documents.date', [$from, $to])
            ->groupBy('outgoing_items.product_id', 'products.name', 'products.sku')
            ->select(
                'outgoing_items.product_id',
                'products.name',
                'products.sku',
                DB::raw('SUM(outgoing_items.quantity * outgoing_items.retail_price) as revenue')
            )
            ->orderByDesc('revenue')
            ->get();

        $total = $items->sum('revenue');
        $cumulative = 0;

        $classified = $items->map(function ($item) use ($total, &$cumulative) {
            $cumulative += $item->revenue;
            $share = $total > 0 ? ($cumulative / $total) * 100 : 0;
            $item->abc = $share <= 80 ? 'A' : ($share <= 95 ? 'B' : 'C');
            $item->share = round($item->revenue / ($total ?: 1) * 100, 2);

            return $item;
        });

        return Inertia::render('tenant/reports/abc', [
            'items' => $classified,
            'filters' => compact('from', 'to'),
        ]);
    }

    public function operators(Request $request): Response
    {
        $from = $request->input('from', now()->subDays(30)->toDateString());
        $to = $request->input('to', now()->toDateString());

        $data = DB::table('outgoing_documents')
            ->join('users', 'users.id', '=', 'outgoing_documents.user_id')
            ->where('outgoing_documents.status', 'confirmed')
            ->whereNull('outgoing_documents.deleted_at')
            ->whereBetween('outgoing_documents.date', [$from, $to])
            ->groupBy('outgoing_documents.user_id', 'users.name')
            ->select(
                'users.name',
                DB::raw('COUNT(*) as documents_count'),
                DB::raw('SUM((SELECT SUM(oi.quantity * oi.retail_price) FROM outgoing_items oi WHERE oi.document_id = outgoing_documents.id)) as total_revenue')
            )
            ->orderByDesc('documents_count')
            ->get();

        return Inertia::render('tenant/reports/operators', [
            'data' => $data,
            'filters' => compact('from', 'to'),
        ]);
    }

    public function dailyChart(Request $request): Response
    {
        $from = $request->input('from', now()->subDays(6)->toDateString());
        $to = $request->input('to', now()->toDateString());

        $incoming = DB::table('incoming_documents')
            ->where('status', 'confirmed')
            ->whereBetween('date', [$from, $to])
            ->groupBy('date')
            ->select('date', DB::raw('COUNT(*) as count'))
            ->orderBy('date')
            ->pluck('count', 'date');

        $outgoing = DB::table('outgoing_documents')
            ->where('status', 'confirmed')
            ->whereNull('deleted_at')
            ->whereBetween('date', [$from, $to])
            ->groupBy('date')
            ->select('date', DB::raw('COUNT(*) as count'))
            ->orderBy('date')
            ->pluck('count', 'date');

        return Inertia::render('tenant/reports/daily-chart', [
            'incoming' => $incoming,
            'outgoing' => $outgoing,
            'filters' => compact('from', 'to'),
        ]);
    }
}
