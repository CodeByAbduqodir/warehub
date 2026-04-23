<?php

declare(strict_types=1);

namespace App\Models\Tenant;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;

class InventoryDocument extends Model
{
    use BelongsToTenant, SoftDeletes;

    protected $fillable = [
        'number',
        'date',
        'warehouse_id',
        'user_id',
        'type',
        'status',
        'note',
        'confirmed_at',
    ];

    protected $casts = [
        'date' => 'date',
        'confirmed_at' => 'datetime',
    ];

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(InventoryItem::class, 'document_id');
    }

    public function isDraft(): bool
    {
        return $this->status === 'draft';
    }

    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    public function discrepancyCount(): int
    {
        return $this->items->filter(
            fn (InventoryItem $item) => $item->actual_qty !== null
                && (float) $item->actual_qty !== (float) $item->expected_qty
        )->count();
    }
}
