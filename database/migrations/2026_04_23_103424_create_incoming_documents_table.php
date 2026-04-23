<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('incoming_documents', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id')->index();
            $table->string('number');
            $table->date('date');
            $table->unsignedBigInteger('supplier_id')->nullable()->index();
            $table->unsignedBigInteger('warehouse_id')->index();
            $table->unsignedBigInteger('user_id')->nullable()->index();
            $table->text('note')->nullable();
            $table->enum('status', ['draft', 'confirmed'])->default('draft');
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('incoming_documents');
    }
};
