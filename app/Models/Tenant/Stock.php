<?php

declare(strict_types=1);

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;

class Stock extends Model
{
    use BelongsToTenant;

    public $timestamps = false;

    protected $table = 'stock';

    protected $fillable = [
        'product_id',
        'warehouse_id',
        'zone_id',
        'cell',
        'quantity',
        'reserved',
    ];

    protected $casts = [
        'quantity' => 'decimal:3',
        'reserved' => 'decimal:3',
        'updated_at' => 'datetime',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function zone(): BelongsTo
    {
        return $this->belongsTo(WarehouseZone::class, 'zone_id');
    }

    public function available(): float
    {
        return (float) ($this->quantity - $this->reserved);
    }
}
