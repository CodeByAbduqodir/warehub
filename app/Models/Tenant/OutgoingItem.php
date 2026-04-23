<?php

declare(strict_types=1);

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OutgoingItem extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'document_id',
        'product_id',
        'quantity',
        'retail_price',
        'zone_id',
    ];

    protected $casts = [
        'quantity' => 'decimal:3',
        'retail_price' => 'decimal:2',
    ];

    public function document(): BelongsTo
    {
        return $this->belongsTo(OutgoingDocument::class, 'document_id');
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function zone(): BelongsTo
    {
        return $this->belongsTo(WarehouseZone::class, 'zone_id');
    }
}
