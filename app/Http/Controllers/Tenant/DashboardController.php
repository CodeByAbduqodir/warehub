<?php

declare(strict_types=1);

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\IncomingDocument;
use App\Models\Tenant\OutgoingDocument;
use App\Models\Tenant\Product;
use App\Models\Tenant\Stock;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        $today = now()->toDateString();
        $weekAgo = now()->subDays(6)->toDateString();

        // KPI
        $productCount = Product::count();

        $todayRevenue = OutgoingDocument::where('status', 'confirmed')
            ->whereDate('confirmed_at', $today)
            ->join('outgoing_items', 'outgoing_items.document_id', '=', 'outgoing_documents.id')
            ->sum(DB::raw('outgoing_items.quantity * outgoing_items.retail_price'));

        $todayIncomingCount = IncomingDocument::where('status', 'confirmed')
            ->whereDate('confirmed_at', $today)
            ->count();

        $lowStockItems = Stock::with('product:id,name,sku,unit,min_stock')
            ->whereHas('product', fn ($q) => $q->where('min_stock', '>', 0))
            ->whereColumn('quantity', '<', DB::raw('(SELECT min_stock FROM products WHERE products.id = stock.product_id)'))
            ->orderBy('quantity')
            ->limit(5)
            ->get();

        // Chart: последние 7 дней
        $incomingChart = IncomingDocument::where('status', 'confirmed')
            ->whereBetween('date', [$weekAgo, $today])
            ->groupBy('date')
            ->select('date', DB::raw('COUNT(*) as count'))
            ->orderBy('date')
            ->pluck('count', 'date');

        $outgoingChart = OutgoingDocument::where('status', 'confirmed')
            ->whereNull('deleted_at')
            ->whereBetween('date', [$weekAgo, $today])
            ->groupBy('date')
            ->select('date', DB::raw('COUNT(*) as count'))
            ->orderBy('date')
            ->pluck('count', 'date');

        // Заполняем все 7 дней
        $chartDays = collect();
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i)->toDateString();
            $chartDays->push([
                'date' => $date,
                'label' => now()->subDays($i)->locale('ru')->isoFormat('dd'),
                'incoming' => $incomingChart[$date] ?? 0,
                'outgoing' => $outgoingChart[$date] ?? 0,
            ]);
        }

        // Последние операции
        $recentIncoming = IncomingDocument::with(['supplier:id,name', 'user:id,name'])
            ->where('status', 'confirmed')
            ->orderByDesc('confirmed_at')
            ->limit(5)
            ->get()
            ->map(fn ($d) => [
                'type' => 'incoming',
                'number' => $d->number,
                'time' => $d->confirmed_at?->format('H:i'),
                'date' => $d->confirmed_at?->toDateString(),
                'counterparty' => $d->supplier?->name ?? '—',
                'user' => $d->user?->name ?? '—',
            ]);

        $recentOutgoing = OutgoingDocument::with(['customer:id,name', 'user:id,name'])
            ->where('status', 'confirmed')
            ->orderByDesc('confirmed_at')
            ->limit(5)
            ->get()
            ->map(fn ($d) => [
                'type' => 'outgoing',
                'number' => $d->number,
                'time' => $d->confirmed_at?->format('H:i'),
                'date' => $d->confirmed_at?->toDateString(),
                'counterparty' => $d->customer?->name ?? 'Розница',
                'user' => $d->user?->name ?? '—',
            ]);

        $recentOperations = $recentIncoming->concat($recentOutgoing)
            ->sortByDesc(fn ($op) => $op['date'].' '.$op['time'])
            ->values()
            ->take(10);

        return Inertia::render('tenant/dashboard', [
            'user' => Auth::user(),
            'kpi' => [
                'productCount' => $productCount,
                'todayRevenue' => (float) $todayRevenue,
                'todayIncomingCount' => $todayIncomingCount,
                'lowStockCount' => $lowStockItems->count(),
            ],
            'chartData' => $chartDays,
            'lowStockItems' => $lowStockItems,
            'recentOperations' => $recentOperations,
        ]);
    }
}
