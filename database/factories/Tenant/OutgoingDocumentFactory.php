<?php

declare(strict_types=1);

namespace Database\Factories\Tenant;

use App\Models\Tenant\OutgoingDocument;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<OutgoingDocument>
 */
class OutgoingDocumentFactory extends Factory
{
    protected $model = OutgoingDocument::class;

    public function definition(): array
    {
        return [
            'number' => 'OUT-'.fake()->year().'-'.fake()->numberBetween(1, 9999),
            'date' => fake()->dateTimeBetween('-3 months', 'now')->format('Y-m-d'),
            'customer_id' => null,
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
