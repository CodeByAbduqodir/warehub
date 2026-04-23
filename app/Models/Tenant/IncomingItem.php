<?php

declare(strict_types=1);

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class IncomingItem extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'document_id',
        'product_id',
        'quantity',
        'purchase_price',
        'zone_id',
        'cell',
    ];

    protected $casts = [
        'quantity' => 'decimal:3',
        'purchase_price' => 'decimal:2',
    ];

    public function document(): BelongsTo
    {
        return $this->belongsTo(IncomingDocument::class, 'document_id');
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
