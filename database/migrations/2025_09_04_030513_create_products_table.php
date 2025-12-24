<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            // id_produk akan menjadi primary key yang auto-increment
            $table->id('id_produk');

            // Kolom untuk nama produk dengan tipe data string
            $table->string('nama_produk');

            // Kolom untuk deskripsi dengan tipe data text agar bisa menampung tulisan panjang
            $table->text('deskripsi');

            // Kolom untuk harga dengan tipe data integer
            $table->integer('harga');

            // Kolom untuk stok dengan tipe data integer
            $table->integer('stok');

            // Kolom untuk menyimpan path atau nama file gambar
            $table->string('gambar');

            // Kolom created_at dan updated_at
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
