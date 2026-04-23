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
        Schema::create('transfer_documents', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id')->index();
            $table->string('number');
            $table->date('date');
            $table->unsignedBigInteger('from_warehouse_id')->index();
            $table->unsignedBigInteger('to_warehouse_id')->index();
            $table->unsignedBigInteger('user_id')->nullable()->index();
            $table->enum('status', ['draft', 'confirmed'])->default('draft');
            $table->text('note')->nullable();
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
        Schema::dropIfExists('transfer_documents');
    }
};
