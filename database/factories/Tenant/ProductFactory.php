<?php

declare(strict_types=1);

namespace Database\Factories\Tenant;

use App\Models\Tenant\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition(): array
    {
        return [
            'name' => fake()->words(3, true),
            'sku' => strtoupper(fake()->bothify('??-####')),
            'barcode' => fake()->ean13(),
            'brand' => fake()->company(),
            'unit' => fake()->randomElement(['шт', 'кг', 'л', 'м', 'упаковка']),
            'purchase_price' => fake()->randomFloat(2, 1000, 500000),
            'retail_price' => fake()->randomFloat(2, 1000, 1000000),
            'currency' => 'UZS',
            'min_stock' => fake()->numberBetween(0, 50),
        ];
    }
}
