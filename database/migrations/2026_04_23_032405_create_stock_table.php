<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stock', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->foreignId('warehouse_id')->constrained('warehouses')->cascadeOnDelete();
            $table->foreignId('zone_id')->nullable()->constrained('warehouse_zones')->nullOnDelete();
            $table->string('cell', 20)->nullable();
            $table->decimal('quantity', 15, 3)->default(0);
            $table->decimal('reserved', 15, 3)->default(0);
            $table->timestamp('updated_at')->nullable();

            $table->unique(['product_id', 'warehouse_id', 'zone_id', 'cell']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stock');
    }
};
