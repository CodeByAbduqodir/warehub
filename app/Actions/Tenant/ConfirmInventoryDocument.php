<?php

declare(strict_types=1);

namespace App\Actions\Tenant;

use App\Models\Tenant\InventoryDocument;
use App\Models\Tenant\InventoryItem;
use App\Models\Tenant\Stock;
use Illuminate\Support\Facades\DB;

class ConfirmInventoryDocument
{
    public function __invoke(InventoryDocument $document): void
    {
        DB::transaction(function () use ($document) {
            $document->items->each(function (InventoryItem $item) use ($document): void {
                if ($item->actual_qty === null) {
                    return;
                }

                $difference = (float) $item->actual_qty - (float) $item->expected_qty;

                if ($difference === 0.0) {
                    return;
                }

                $stock = Stock::firstOrNew([
                    'product_id' => $item->product_id,
                    'warehouse_id' => $document->warehouse_id,
                    'zone_id' => null,
                    'cell' => null,
                ]);

                $stock->quantity = max(0, (float) $stock->quantity + $difference);
                $stock->reserved = $stock->reserved ?? 0;
                $stock->save();
            });

            $document->update([
                'status' => 'completed',
                'confirmed_at' => now(),
            ]);
        });
    }
}
