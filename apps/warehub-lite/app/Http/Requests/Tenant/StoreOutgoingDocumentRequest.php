<?php

declare(strict_types=1);

namespace App\Http\Requests\Tenant;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Warehub\Core\Support\TenantRule;

class StoreOutgoingDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, ValidationRule|array<mixed>|string> */
    public function rules(): array
    {
        return [
            'date' => ['required', 'date'],
            'customer_id' => ['nullable', 'integer', TenantRule::exists('customers')],
            'warehouse_id' => ['nullable', 'integer', TenantRule::exists('warehouses')],
            'note' => ['nullable', 'string', 'max:2000'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer', TenantRule::exists('products')],
            'items.*.quantity' => ['required', 'numeric', 'min:0.001'],
            'items.*.retail_price' => ['required', 'numeric', 'min:0'],
        ];
    }
}
