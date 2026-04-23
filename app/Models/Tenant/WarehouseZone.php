<?php

declare(strict_types=1);

namespace App\Models\Tenant;

use Database\Factories\Tenant\WarehouseZoneFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WarehouseZone extends Model
{
    /** @use HasFactory<WarehouseZoneFactory> */
    use HasFactory;

    protected $fillable = ['warehouse_id', 'code', 'name'];

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function stock(): HasMany
    {
        return $this->hasMany(Stock::class, 'zone_id');
    }
}
