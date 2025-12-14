<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            // Pointing to 'products' table, column 'id_produk'
            $table->foreignId('product_id')->constrained('products', 'id_produk')->cascadeOnDelete();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->integer('rating')->unsigned(); // 1-5 stars
            $table->text('comment')->nullable();
            $table->json('photos')->nullable();
            $table->boolean('is_visible')->default(true); // For moderation
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};
