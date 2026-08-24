<?php

declare(strict_types=1);

namespace Warehub\Core\Actions\Tenant;

use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Warehub\Core\Models\Tenant\OutgoingDocument;
use Warehub\Core\Models\Tenant\Stock;

class ConfirmOutgoingDocument
{
    public function __invoke(OutgoingDocument $document): void
    {
        DB::transaction(function () use ($document) {
            $lockedDocument = OutgoingDocument::query()
                ->whereKey($document->getKey())
                ->lockForUpdate()
                ->firstOrFail();

            if ($lockedDocument->isConfirmed()) {
                return;
            }

            foreach ($lockedDocument->items()->with('product')->get() as $item) {
                $stocks = Stock::where('product_id', $item->product_id)
                    ->when($lockedDocument->warehouse_id, fn ($query) => $query->where('warehouse_id', $lockedDocument->warehouse_id))
                    ->when($item->zone_id, fn ($query) => $query->where('zone_id', $item->zone_id))
                    ->orderBy('id')
                    ->lockForUpdate()
                    ->get();

                $available = $stocks->sum(fn (Stock $stock): float => max(0, $stock->available()));

                if ($available < (float) $item->quantity) {
                    throw ValidationException::withMessages([
                        'items' => "Недостаточно товара «{$item->product->name}» на складе. Доступно: {$available}, нужно: {$item->quantity}.",
                    ]);
                }

                $remaining = (float) $item->quantity;

                foreach ($stocks as $stock) {
                    $deduction = min($remaining, max(0, $stock->available()));

                    if ($deduction > 0) {
                        $stock->decrement('quantity', $deduction);
                        $remaining -= $deduction;
                    }

                    if ($remaining <= 0) {
                        break;
                    }
                }
            }

            $lockedDocument->update([
                'status' => 'confirmed',
                'confirmed_at' => now(),
            ]);
        });
    }
}
