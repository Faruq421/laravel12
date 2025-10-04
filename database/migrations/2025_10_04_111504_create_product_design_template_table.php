<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_design_template', function (Blueprint $table) {
            $table->foreignId('product_id_produk')->constrained('products', 'id_produk')->onDelete('cascade');
            $table->foreignId('design_template_id')->constrained('design_templates')->onDelete('cascade');
            $table->primary(['product_id_produk', 'design_template_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_design_template');
    }
};