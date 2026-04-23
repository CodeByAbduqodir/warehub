<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Central\Tenant;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class TenantSeeder extends Seeder
{
    public function run(): void
    {
        $tenant = Tenant::firstOrCreate(
            ['subdomain' => 'demo'],
            [
                'name' => 'Demo Company',
                'owner_email' => 'owner@demo.test',
                'status' => 'active',
            ]
        );

        $tenant->domains()->firstOrCreate(['domain' => 'demo.'.config('app.domain', 'warehub.test')]);

        tenancy()->initialize($tenant);

        User::firstOrCreate(
            ['email' => 'admin@demo.test'],
            [
                'name' => 'Demo Admin',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );

        tenancy()->end();
    }
}
