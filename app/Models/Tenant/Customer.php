<?php

declare(strict_types=1);

namespace App\Models\Tenant;

use Database\Factories\Tenant\CustomerFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Stancl\Tenancy\Database\Concerns\BelongsToTenant;

class Customer extends Model
{
    /** @use HasFactory<CustomerFactory> */
    use BelongsToTenant, HasFactory;

    protected $fillable = [
        'name',
        'phone',
        'email',
        'address',
        'note',
    ];

    public function outgoingDocuments(): HasMany
    {
        return $this->hasMany(OutgoingDocument::class);
    }
}
