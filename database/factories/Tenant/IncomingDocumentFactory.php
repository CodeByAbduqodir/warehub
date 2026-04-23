<?php

declare(strict_types=1);

namespace Database\Factories\Tenant;

use App\Models\Tenant\IncomingDocument;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<IncomingDocument>
 */
class IncomingDocumentFactory extends Factory
{
    protected $model = IncomingDocument::class;

    public function definition(): array
    {
        return [
            'number' => 'IN-'.fake()->year().'-'.fake()->numberBetween(1, 9999),
            'date' => fake()->dateTimeBetween('-3 months', 'now')->format('Y-m-d'),
            'supplier_id' => null,
            'warehouse_id' => null,
            'user_id' => null,
            'note' => null,
            'status' => 'draft',
            'confirmed_at' => null,
        ];
    }

    public function confirmed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'confirmed',
            'confirmed_at' => now(),
        ]);
    }
}
