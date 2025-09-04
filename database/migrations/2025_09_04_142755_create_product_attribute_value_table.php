<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Nama tabel pivot mengikuti konvensi Laravel (tanpa 's' di akhir)
        Schema::create('product_attribute_value', function (Blueprint $table) {
            $table->id();
            // Pastikan nama foreign key cocok dengan primary key di tabel products
            $table->foreignId('product_id_produk')->constrained('products', 'id_produk')->onDelete('cascade');
            $table->foreignId('attribute_value_id')->constrained('attribute_values')->onDelete('cascade');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_attribute_value');
    }
};
