<?php

declare(strict_types=1);

namespace Database\Factories\Tenant;

use App\Models\Tenant\Warehouse;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Warehouse>
 */
class WarehouseFactory extends Factory
{
    protected $model = Warehouse::class;

    public function definition(): array
    {
        return [
            'name' => fake()->randomElement(['Главный склад', 'Склад А', 'Склад Б', 'Филиал']).' #'.fake()->numberBetween(1, 99),
            'address' => fake()->address(),
            'phone' => '+998 '.fake()->numerify('## ### ## ##'),
        ];
    }
}
