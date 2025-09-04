<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('product_attribute_value', function (Blueprint $table) {
            // Menambahkan kolom harga setelah attribute_value_id
            // Harga ini bisa berupa harga total varian atau harga tambahan (modifier)
            // Default 0 berarti tidak ada perubahan harga
            $table->integer('price')->default(0)->after('attribute_value_id');
        });
    }

    public function down(): void
    {
        Schema::table('product_attribute_value', function (Blueprint $table) {
            $table->dropColumn('price');
        });
    }
};
