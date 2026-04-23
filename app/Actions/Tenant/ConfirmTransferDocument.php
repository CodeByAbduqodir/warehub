<?php

declare(strict_types=1);

namespace App\Actions\Tenant;

use App\Models\Tenant\Stock;
use App\Models\Tenant\TransferDocument;
use App\Models\Tenant\TransferItem;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ConfirmTransferDocument
{
    public function __invoke(TransferDocument $document): void
    {
        DB::transaction(function () use ($document) {
            foreach ($document->items as $item) {
                /** @var TransferItem $item */
                $fromStock = Stock::where('product_id', $item->product_id)
                    ->where('warehouse_id', $document->from_warehouse_id)
                    ->lockForUpdate()
                    ->first();

                $available = $fromStock ? (float) $fromStock->quantity - (float) $fromStock->reserved : 0;

                if ($available < (float) $item->quantity) {
                    throw ValidationException::withMessages([
                        'items' => "Недостаточно товара «{$item->product->name}» на складе-источнике. Доступно: {$available}, нужно: {$item->quantity}.",
                    ]);
                }

                $fromStock->decrement('quantity', (float) $item->quantity);

                $toStock = Stock::firstOrNew([
                    'product_id' => $item->product_id,
                    'warehouse_id' => $document->to_warehouse_id,
                    'zone_id' => null,
                    'cell' => null,
                ]);

                $toStock->quantity = (float) $toStock->quantity + (float) $item->quantity;
                $toStock->reserved = $toStock->reserved ?? 0;
                $toStock->save();
            }

            $document->update([
                'status' => 'confirmed',
                'confirmed_at' => now(),
            ]);
        });
    }
}
