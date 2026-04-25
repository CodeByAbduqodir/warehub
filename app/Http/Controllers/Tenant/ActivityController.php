<?php

declare(strict_types=1);

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\IncomingDocument;
use App\Models\Tenant\InventoryDocument;
use App\Models\Tenant\OutgoingDocument;
use App\Models\Tenant\TransferDocument;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class ActivityController extends Controller
{
    private const FETCH_LIMIT = 500;

    private const PER_PAGE = 30;

    public function __invoke(): Response
    {
        $type = request('type', 'all');

        $activities = collect()
            ->when(in_array($type, ['all', 'incoming']), fn (Collection $c) => $c->concat($this->incoming()))
            ->when(in_array($type, ['all', 'outgoing']), fn (Collection $c) => $c->concat($this->outgoing()))
            ->when(in_array($type, ['all', 'transfer']), fn (Collection $c) => $c->concat($this->transfers()))
            ->when(in_array($type, ['all', 'inventory']), fn (Collection $c) => $c->concat($this->inventories()))
            ->filter(fn ($item) => $item['timestamp'] !== null)
            ->sortByDesc('timestamp')
            ->values();

        $page = (int) request('page', 1);

        $paginated = new LengthAwarePaginator(
            $activities->forPage($page, self::PER_PAGE)->values(),
            $activities->count(),
            self::PER_PAGE,
            $page,
            ['path' => '/activity', 'query' => ['type' => $type]],
        );

        return Inertia::render('tenant/activity/index', [
            'activities' => $paginated,
            'activeType' => $type,
        ]);
    }

    private function incoming(): Collection
    {
        return IncomingDocument::with(['supplier:id,name', 'user:id,name', 'warehouse:id,name'])
            ->where('status', 'confirmed')
            ->orderByDesc('confirmed_at')
            ->limit(self::FETCH_LIMIT)
            ->get()
            ->map(fn (IncomingDocument $d) => [
                'type' => 'incoming',
                'label' => 'Приход',
                'number' => $d->number,
                'timestamp' => $d->confirmed_at?->toIso8601String(),
                'time' => $d->confirmed_at?->format('H:i'),
                'date' => $d->confirmed_at?->toDateString(),
                'counterparty' => $d->supplier?->name,
                'warehouse' => $d->warehouse?->name,
                'user' => $d->user?->name,
                'link' => "/incoming/{$d->id}",
            ]);
    }

    private function outgoing(): Collection
    {
        return OutgoingDocument::with(['customer:id,name', 'user:id,name', 'warehouse:id,name'])
            ->where('status', 'confirmed')
            ->orderByDesc('confirmed_at')
            ->limit(self::FETCH_LIMIT)
            ->get()
            ->map(fn (OutgoingDocument $d) => [
                'type' => 'outgoing',
                'label' => 'Продажа',
                'number' => $d->number,
                'timestamp' => $d->confirmed_at?->toIso8601String(),
                'time' => $d->confirmed_at?->format('H:i'),
                'date' => $d->confirmed_at?->toDateString(),
                'counterparty' => $d->customer?->name ?? 'Розница',
                'warehouse' => $d->warehouse?->name,
                'user' => $d->user?->name,
                'link' => "/outgoing/{$d->id}",
            ]);
    }

    private function transfers(): Collection
    {
        return TransferDocument::with(['fromWarehouse:id,name', 'toWarehouse:id,name', 'user:id,name'])
            ->where('status', 'confirmed')
            ->orderByDesc('confirmed_at')
            ->limit(self::FETCH_LIMIT)
            ->get()
            ->map(fn (TransferDocument $d) => [
                'type' => 'transfer',
                'label' => 'Перемещение',
                'number' => $d->number,
                'timestamp' => $d->confirmed_at?->toIso8601String(),
                'time' => $d->confirmed_at?->format('H:i'),
                'date' => $d->confirmed_at?->toDateString(),
                'counterparty' => trim(($d->fromWarehouse?->name ?? '—').' → '.($d->toWarehouse?->name ?? '—')),
                'warehouse' => null,
                'user' => $d->user?->name,
                'link' => "/transfers/{$d->id}",
            ]);
    }

    private function inventories(): Collection
    {
        return InventoryDocument::with(['warehouse:id,name', 'user:id,name'])
            ->where('status', 'completed')
            ->orderByDesc('confirmed_at')
            ->limit(self::FETCH_LIMIT)
            ->get()
            ->map(fn (InventoryDocument $d) => [
                'type' => 'inventory',
                'label' => 'Инвентаризация',
                'number' => $d->number,
                'timestamp' => $d->confirmed_at?->toIso8601String(),
                'time' => $d->confirmed_at?->format('H:i'),
                'date' => $d->confirmed_at?->toDateString(),
                'counterparty' => null,
                'warehouse' => $d->warehouse?->name,
                'user' => $d->user?->name,
                'link' => "/inventory/{$d->id}",
            ]);
    }
}
