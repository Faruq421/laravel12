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
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('order_status')->default('pending');
            $table->decimal('total_price', 15, 2);
            $table->text('shipping_address'); // Disimpan sebagai JSON
            $table->decimal('shipping_cost', 15, 2)->default(0);
            $table->string('shipping_method')->nullable();
            $table->string('payment_method')->nullable();
            $table->string('payment_status')->default('unpaid');
            $table->date('estimated_completion_date')->nullable();
            $table->text('admin_notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};