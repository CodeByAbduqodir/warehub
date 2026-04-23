<?php

declare(strict_types=1);

namespace App\Models\Tenant;

use App\Models\User;
use Database\Factories\Tenant\WarehouseFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;

class Warehouse extends Model
{
    /** @use HasFactory<WarehouseFactory> */
    use BelongsToTenant, HasFactory;

    protected $fillable = ['name', 'address', 'phone', 'manager_id'];

    public function manager(): BelongsTo
    {
        return $this->belongsTo(User::class, 'manager_id');
    }

    public function zones(): HasMany
    {
        return $this->hasMany(WarehouseZone::class);
    }

    public function stock(): HasMany
    {
        return $this->hasMany(Stock::class);
    }
}
