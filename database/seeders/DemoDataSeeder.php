<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Central\Tenant;
use App\Models\Tenant\Category;
use App\Models\Tenant\Customer;
use App\Models\Tenant\IncomingDocument;
use App\Models\Tenant\IncomingItem;
use App\Models\Tenant\OutgoingDocument;
use App\Models\Tenant\OutgoingItem;
use App\Models\Tenant\Product;
use App\Models\Tenant\Stock;
use App\Models\Tenant\Supplier;
use App\Models\Tenant\Warehouse;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        $tenant = Tenant::firstOrCreate(
            ['subdomain' => 'demo'],
            [
                'name' => 'Mayki Store',
                'owner_email' => 'owner@demo.test',
                'status' => 'active',
            ]
        );

        $tenant->domains()->firstOrCreate([
            'domain' => 'demo.'.config('app.domain', 'warehub.test'),
        ]);

        tenancy()->initialize($tenant);

        $user = User::firstOrCreate(
            ['email' => 'admin@demo.test'],
            [
                'name' => 'Алишер Юсупов',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );

        // ── Categories ──────────────────────────────────────────────────────
        $electronics = Category::firstOrCreate(['name' => 'Электроника']);
        $clothing = Category::firstOrCreate(['name' => 'Одежда']);
        $food = Category::firstOrCreate(['name' => 'Продукты']);
        $stationery = Category::firstOrCreate(['name' => 'Канцтовары']);

        // ── Warehouses ───────────────────────────────────────────────────────
        $main = Warehouse::firstOrCreate(
            ['name' => 'Главный склад'],
            ['address' => 'г. Ташкент, ул. Амир Темур 15', 'phone' => '+998 71 123 45 67']
        );
        $branch = Warehouse::firstOrCreate(
            ['name' => 'Склад Чиланзар'],
            ['address' => 'г. Ташкент, Чиланзар-9', 'phone' => '+998 71 456 78 90']
        );

        // ── Suppliers ────────────────────────────────────────────────────────
        $s1 = Supplier::firstOrCreate(['name' => 'ООО "ТехноИмпорт"'], [
            'phone' => '+998 71 200 11 22', 'email' => 'techno@import.uz',
            'address' => 'Ташкент, ул. Бунёдкор 23',
        ]);
        $s2 = Supplier::firstOrCreate(['name' => 'ИП "АзизТрейд"'], [
            'phone' => '+998 90 345 67 89', 'email' => 'aziz@trade.uz',
            'address' => 'Ташкент, Сергели район',
        ]);
        $s3 = Supplier::firstOrCreate(['name' => 'ООО "ОптТовар"'], [
            'phone' => '+998 71 300 22 33', 'email' => 'opt@tovar.uz',
            'address' => 'Ташкент, Юнусабад',
        ]);

        // ── Customers ────────────────────────────────────────────────────────
        $c1 = Customer::firstOrCreate(['name' => 'Бобур Рашидов'], [
            'phone' => '+998 90 111 22 33', 'email' => 'bobur@mail.ru',
        ]);
        $c2 = Customer::firstOrCreate(['name' => 'ООО "Мегаопт"'], [
            'phone' => '+998 71 222 33 44', 'email' => 'mega@opt.uz',
        ]);
        $c3 = Customer::firstOrCreate(['name' => 'Малика Юсупова'], [
            'phone' => '+998 93 555 66 77',
        ]);

        // ── Products ─────────────────────────────────────────────────────────
        $defs = [
            ['name' => 'Samsung Galaxy A55 128GB',         'sku' => 'SAM-A55-128',  'category_id' => $electronics->id, 'purchase_price' => 3_200_000, 'retail_price' => 3_800_000, 'unit' => 'шт',      'min_stock' => 5],
            ['name' => 'Xiaomi Redmi Note 13 256GB',        'sku' => 'XMI-RN13-256', 'category_id' => $electronics->id, 'purchase_price' => 2_400_000, 'retail_price' => 2_900_000, 'unit' => 'шт',      'min_stock' => 5],
            ['name' => 'Наушники JBL Tune 520',             'sku' => 'JBL-T520-BLK', 'category_id' => $electronics->id, 'purchase_price' => 380_000, 'retail_price' => 490_000, 'unit' => 'шт',      'min_stock' => 3],
            ['name' => 'Кабель USB-C 2м',                   'sku' => 'CBL-USBC-2M',  'category_id' => $electronics->id, 'purchase_price' => 25_000, 'retail_price' => 45_000, 'unit' => 'шт',      'min_stock' => 20],
            ['name' => 'Футболка базовая белая L',           'sku' => 'TSH-WHT-L',    'category_id' => $clothing->id,    'purchase_price' => 35_000, 'retail_price' => 65_000, 'unit' => 'шт',      'min_stock' => 10],
            ['name' => 'Футболка базовая чёрная L',          'sku' => 'TSH-BLK-L',    'category_id' => $clothing->id,    'purchase_price' => 35_000, 'retail_price' => 65_000, 'unit' => 'шт',      'min_stock' => 10],
            ['name' => 'Джинсы slim fit 32/32',              'sku' => 'JNS-SLM-3232', 'category_id' => $clothing->id,    'purchase_price' => 120_000, 'retail_price' => 210_000, 'unit' => 'шт',      'min_stock' => 5],
            ['name' => 'Худи с принтом XL',                  'sku' => 'HDI-PRT-XL',   'category_id' => $clothing->id,    'purchase_price' => 95_000, 'retail_price' => 165_000, 'unit' => 'шт',      'min_stock' => 8],
            ['name' => 'Кофе Nescafe растворимый 200г',     'sku' => 'COF-NES-200',  'category_id' => $food->id,        'purchase_price' => 48_000, 'retail_price' => 72_000, 'unit' => 'шт',      'min_stock' => 15],
            ['name' => 'Чай Ahmad Tea 100 пакетиков',        'sku' => 'TEA-AHM-100',  'category_id' => $food->id,        'purchase_price' => 32_000, 'retail_price' => 48_000, 'unit' => 'шт',      'min_stock' => 20],
            ['name' => 'Сахар рафинад 1кг',                  'sku' => 'SGR-RAF-1KG',  'category_id' => $food->id,        'purchase_price' => 12_000, 'retail_price' => 18_000, 'unit' => 'кг',      'min_stock' => 50],
            ['name' => 'Масло подсолнечное 1л',              'sku' => 'OIL-SUN-1L',   'category_id' => $food->id,        'purchase_price' => 22_000, 'retail_price' => 32_000, 'unit' => 'л',       'min_stock' => 30],
            ['name' => 'Ручка шариковая синяя (уп. 50шт)',   'sku' => 'PEN-BLU-50',   'category_id' => $stationery->id,  'purchase_price' => 15_000, 'retail_price' => 28_000, 'unit' => 'упаковка', 'min_stock' => 10],
            ['name' => 'Тетрадь 96л клетка',                 'sku' => 'NTB-96-CLK',   'category_id' => $stationery->id,  'purchase_price' => 8_000, 'retail_price' => 14_000, 'unit' => 'шт',      'min_stock' => 20],
            ['name' => 'Бумага А4 500л 80г/м²',              'sku' => 'PAP-A4-500',   'category_id' => $stationery->id,  'purchase_price' => 45_000, 'retail_price' => 68_000, 'unit' => 'шт',      'min_stock' => 15],
        ];

        $products = [];
        foreach ($defs as $data) {
            $products[] = Product::firstOrCreate(['sku' => $data['sku']], $data);
        }

        // Ensure stock rows exist for each product in main warehouse
        foreach ($products as $product) {
            Stock::firstOrCreate(
                ['product_id' => $product->id, 'warehouse_id' => $main->id],
                ['quantity' => 0, 'reserved' => 0]
            );
        }

        // ── Incoming documents ───────────────────────────────────────────────
        $incoming = [
            [
                'number' => 'INC-2026-0001', 'supplier' => $s1, 'daysAgo' => 28,
                'items' => [
                    [$products[0], 10, 3_200_000],
                    [$products[1], 15, 2_400_000],
                    [$products[2], 20,   380_000],
                ],
            ],
            [
                'number' => 'INC-2026-0002', 'supplier' => $s2, 'daysAgo' => 25,
                'items' => [
                    [$products[4], 50, 35_000],
                    [$products[5], 50, 35_000],
                    [$products[6], 30, 120_000],
                    [$products[7], 25,  95_000],
                ],
            ],
            [
                'number' => 'INC-2026-0003', 'supplier' => $s3, 'daysAgo' => 20,
                'items' => [
                    [$products[8],  100, 48_000],
                    [$products[9],   80, 32_000],
                    [$products[10], 200, 12_000],
                    [$products[11], 150, 22_000],
                ],
            ],
            [
                'number' => 'INC-2026-0004', 'supplier' => $s3, 'daysAgo' => 15,
                'items' => [
                    [$products[12], 40, 15_000],
                    [$products[13], 60,  8_000],
                    [$products[14], 30, 45_000],
                ],
            ],
            [
                'number' => 'INC-2026-0005', 'supplier' => $s1, 'daysAgo' => 7,
                'items' => [
                    [$products[3], 100, 25_000],
                    [$products[0],   5, 3_200_000],
                    [$products[1],   8, 2_400_000],
                ],
            ],
            [
                'number' => 'INC-2026-0006', 'supplier' => $s2, 'daysAgo' => 3,
                'items' => [
                    [$products[4], 20, 35_000],
                    [$products[5], 20, 35_000],
                ],
            ],
            [
                'number' => 'INC-2026-0007', 'supplier' => $s1, 'daysAgo' => 0,
                'items' => [
                    [$products[2], 10, 380_000],
                ],
            ],
        ];

        foreach ($incoming as $d) {
            if (IncomingDocument::where('number', $d['number'])->exists()) {
                continue;
            }

            $date = CarbonImmutable::now()->subDays($d['daysAgo']);
            $doc = IncomingDocument::create([
                'number' => $d['number'],
                'date' => $date->toDateString(),
                'supplier_id' => $d['supplier']->id,
                'warehouse_id' => $main->id,
                'user_id' => $user->id,
                'status' => 'confirmed',
                'confirmed_at' => $date,
            ]);

            foreach ($d['items'] as [$product, $qty, $price]) {
                IncomingItem::create([
                    'document_id' => $doc->id,
                    'product_id' => $product->id,
                    'quantity' => $qty,
                    'purchase_price' => $price,
                ]);

                $stock = Stock::firstOrNew(['product_id' => $product->id, 'warehouse_id' => $main->id]);
                $stock->quantity = (float) $stock->quantity + $qty;
                $stock->reserved ??= 0;
                $stock->save();
            }
        }

        // ── Outgoing documents ───────────────────────────────────────────────
        $outgoing = [
            [
                'number' => 'OUT-2026-0001', 'customer' => $c1, 'daysAgo' => 26,
                'items' => [[$products[0], 2, 3_800_000], [$products[2], 3, 490_000]],
            ],
            [
                'number' => 'OUT-2026-0002', 'customer' => $c2, 'daysAgo' => 23,
                'items' => [[$products[4], 15, 65_000], [$products[5], 15, 65_000], [$products[6], 8, 210_000]],
            ],
            [
                'number' => 'OUT-2026-0003', 'customer' => null, 'daysAgo' => 21,
                'items' => [[$products[8], 20, 72_000], [$products[9], 15, 48_000], [$products[10], 30, 18_000]],
            ],
            [
                'number' => 'OUT-2026-0004', 'customer' => $c3, 'daysAgo' => 18,
                'items' => [[$products[1], 3, 2_900_000], [$products[3], 10, 45_000]],
            ],
            [
                'number' => 'OUT-2026-0005', 'customer' => $c2, 'daysAgo' => 14,
                'items' => [[$products[12], 10, 28_000], [$products[13], 20, 14_000], [$products[14], 5, 68_000]],
            ],
            [
                'number' => 'OUT-2026-0006', 'customer' => null, 'daysAgo' => 10,
                'items' => [[$products[4], 10, 65_000], [$products[7], 5, 165_000]],
            ],
            [
                'number' => 'OUT-2026-0007', 'customer' => $c1, 'daysAgo' => 6,
                'items' => [[$products[0], 1, 3_800_000], [$products[2], 2, 490_000]],
            ],
            [
                'number' => 'OUT-2026-0008', 'customer' => $c3, 'daysAgo' => 4,
                'items' => [[$products[8], 10, 72_000], [$products[11], 20, 32_000]],
            ],
            [
                'number' => 'OUT-2026-0009', 'customer' => $c2, 'daysAgo' => 2,
                'items' => [[$products[5], 8, 65_000], [$products[6], 4, 210_000]],
            ],
            [
                'number' => 'OUT-2026-0010', 'customer' => null, 'daysAgo' => 1,
                'items' => [[$products[9], 10, 48_000], [$products[10], 20, 18_000], [$products[3], 15, 45_000]],
            ],
            [
                'number' => 'OUT-2026-0011', 'customer' => $c1, 'daysAgo' => 0,
                'items' => [[$products[1], 2, 2_900_000]],
            ],
            [
                'number' => 'OUT-2026-0012', 'customer' => $c3, 'daysAgo' => 0,
                'items' => [[$products[4], 5, 65_000], [$products[13], 15, 14_000]],
            ],
        ];

        foreach ($outgoing as $d) {
            if (OutgoingDocument::where('number', $d['number'])->exists()) {
                continue;
            }

            $date = CarbonImmutable::now()->subDays($d['daysAgo']);
            $doc = OutgoingDocument::create([
                'number' => $d['number'],
                'date' => $date->toDateString(),
                'customer_id' => $d['customer']?->id,
                'warehouse_id' => $main->id,
                'user_id' => $user->id,
                'status' => 'confirmed',
                'confirmed_at' => $date,
            ]);

            foreach ($d['items'] as [$product, $qty, $price]) {
                OutgoingItem::create([
                    'document_id' => $doc->id,
                    'product_id' => $product->id,
                    'quantity' => $qty,
                    'retail_price' => $price,
                ]);

                $stock = Stock::where(['product_id' => $product->id, 'warehouse_id' => $main->id])->first();
                if ($stock) {
                    $stock->quantity = max(0, (float) $stock->quantity - $qty);
                    $stock->save();
                }
            }
        }

        tenancy()->end();
    }
}
