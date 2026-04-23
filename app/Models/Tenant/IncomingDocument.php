<?php

declare(strict_types=1);

namespace App\Models\Tenant;

use App\Models\User;
use Database\Factories\Tenant\IncomingDocumentFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;

class IncomingDocument extends Model
{
    /** @use HasFactory<IncomingDocumentFactory> */
    use BelongsToTenant, HasFactory, SoftDeletes;

    protected $fillable = [
        'number',
        'date',
        'supplier_id',
        'warehouse_id',
        'user_id',
        'note',
        'status',
        'confirmed_at',
    ];

    protected $casts = [
        'date' => 'date',
        'confirmed_at' => 'datetime',
    ];

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

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
        return $this->hasMany(IncomingItem::class, 'document_id');
    }

    public function isDraft(): bool
    {
        return $this->status === 'draft';
    }

    public function isConfirmed(): bool
    {
        return $this->status === 'confirmed';
    }

    public function totalAmount(): float
    {
        return (float) $this->items->sum(fn (IncomingItem $item) => $item->quantity * $item->purchase_price);
    }
}
