<?php

declare(strict_types=1);

namespace App\Models\Tenant;

use Database\Factories\Tenant\ProductFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;

class Product extends Model
{
    /** @use HasFactory<ProductFactory> */
    use BelongsToTenant, HasFactory;

    protected $fillable = [
        'sku',
        'barcode',
        'name',
        'description',
        'category_id',
        'brand',
        'unit',
        'purchase_price',
        'retail_price',
        'currency',
        'min_stock',
        'photos',
    ];

    protected $casts = [
        'photos' => 'array',
        'purchase_price' => 'decimal:2',
        'retail_price' => 'decimal:2',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function stock(): HasMany
    {
        return $this->hasMany(Stock::class);
    }

    public function totalStock(): float
    {
        return (float) $this->stock()->sum('quantity');
    }
}
