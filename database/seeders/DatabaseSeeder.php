<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Central\SuperAdmin;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        SuperAdmin::firstOrCreate(
            ['email' => 'admin@warehub.test'],
            ['name' => 'Super Admin', 'password' => Hash::make('password')]
        );

        $this->call(DemoDataSeeder::class);
    }
}
