<?php

declare(strict_types=1);

namespace App\Models\Tenant;

use Database\Factories\Tenant\SupplierFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;

class Supplier extends Model
{
    /** @use HasFactory<SupplierFactory> */
    use BelongsToTenant, HasFactory;

    protected $fillable = [
        'name',
        'phone',
        'email',
        'address',
        'note',
    ];

    public function incomingDocuments(): HasMany
    {
        return $this->hasMany(IncomingDocument::class);
    }
}
