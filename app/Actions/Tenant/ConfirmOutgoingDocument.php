<?php

declare(strict_types=1);

namespace App\Actions\Tenant;

use App\Models\Tenant\OutgoingDocument;
use App\Models\Tenant\Stock;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ConfirmOutgoingDocument
{
    public function __invoke(OutgoingDocument $document): void
    {
        DB::transaction(function () use ($document) {
            foreach ($document->items as $item) {
                $stock = Stock::where('product_id', $item->product_id)
                    ->where('warehouse_id', $document->warehouse_id)
                    ->when($item->zone_id, fn ($q) => $q->where('zone_id', $item->zone_id))
                    ->lockForUpdate()
                    ->first();

                $available = $stock ? (float) $stock->quantity - (float) $stock->reserved : 0;

                if ($available < (float) $item->quantity) {
                    throw ValidationException::withMessages([
                        'items' => "Недостаточно товара «{$item->product->name}» на складе. Доступно: {$available}, нужно: {$item->quantity}.",
                    ]);
                }

                $stock->decrement('quantity', (float) $item->quantity);
            }

            $document->update([
                'status' => 'confirmed',
                'confirmed_at' => now(),
            ]);
        });
    }
}
