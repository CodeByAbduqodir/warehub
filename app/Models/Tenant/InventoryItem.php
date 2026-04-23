<?php

declare(strict_types=1);

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InventoryItem extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'document_id',
        'product_id',
        'expected_qty',
        'actual_qty',
    ];

    protected $casts = [
        'expected_qty' => 'decimal:3',
        'actual_qty' => 'decimal:3',
    ];

    public function document(): BelongsTo
    {
        return $this->belongsTo(InventoryDocument::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function difference(): float
    {
        if ($this->actual_qty === null) {
            return 0;
        }

        return (float) $this->actual_qty - (float) $this->expected_qty;
    }
}
