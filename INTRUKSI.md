Instruksi Teknis: Implementasi Fitur Opsi Desain Produk
1. Persona AI
Anda adalah AI Developer Assistant. Tugas Anda adalah mengeksekusi serangkaian perintah php artisan, membuat file, dan memodifikasi kode yang ada sesuai dengan instruksi di bawah ini. Anda harus memahami konteks proyek dari file GEMINI.md dan menggunakan perintah php artisan make:feature jika diinstruksikan.

2. Tujuan Utama
Mengimplementasikan fitur "Opsi Desain" untuk produk, yang memungkinkan pelanggan memilih antara mengunggah desain mereka sendiri atau memilih dari template yang disediakan toko.

FASE 1: Fondasi Backend (Database & Model)
Langkah 1.1: Buat Migrasi untuk Menambah Opsi Desain pada Produk
Jalankan perintah berikut di terminal:

php artisan make:migration add_design_options_to_products_table --table=products

Langkah 1.2: Modifikasi File Migrasi add_design_options
Buka file migrasi yang baru dibuat di database/migrations/ dan ganti seluruh isinya dengan kode berikut:

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->boolean('allow_custom_design')->default(false)->after('status');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('allow_custom_design');
        });
    }
};

Langkah 1.3: Buat Fitur Baru untuk DesignTemplate Menggunakan Stub
Jalankan perintah make:feature untuk membuat kerangka CRUD lengkap untuk template desain:

php artisan make:feature DesignTemplate

Langkah 1.4: Modifikasi File Migrasi create_design_templates_table
Buka file migrasi ..._create_design_templates_table.php yang baru dibuat oleh make:feature dan ganti seluruh isinya dengan kode berikut:

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('design_templates', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('thumbnail_path');
            $table->string('file_path');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('design_templates');
    }
};

Langkah 1.5: Buat Migrasi untuk Tabel Pivot
Buat migrasi untuk tabel penghubung antara produk dan template desain:

php artisan make:migration create_product_design_template_table

Langkah 1.6: Modifikasi File Migrasi Tabel Pivot
Buka file ..._create_product_design_template_table.php dan ganti seluruh isinya:

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

Langkah 1.7: Terapkan Semua Migrasi
Jalankan perintah migrate untuk membuat semua tabel baru di database:

php artisan migrate

Langkah 1.8: Tambahkan Relasi pada Model
Buka app/Features/Product/Product.php, dan tambahkan method relasi berikut di dalam class Product:

public function designTemplates()
{
    return $this->belongsToMany(
        \App\Features\Product\DesignTemplate::class,
        'product_design_template',
        'product_id_produk',
        'design_template_id'
    );
}

Buka app/Features/Product/DesignTemplate.php (dibuat oleh make:feature), dan tambahkan method relasi berikut:

public function products()
{
    return $this->belongsToMany(
        \App\Features\Product\Product::class,
        'product_design_template',
        'design_template_id',
        'product_id_produk'
    );
}

FASE 2: Implementasi Sisi Admin
Langkah 2.1: Modifikasi Controller DesignTemplate
Buka app/Features/Product/DesignTemplateController.php dan implementasikan logika untuk menangani unggahan file pada method store() dan update(), serta logika penghapusan file pada method destroy().

Langkah 2.2: Modifikasi Form Produk Admin
Buka resources/js/Pages/Features/Product/FormPage.tsx dan tambahkan:

Sebuah komponen <Switch> dari shadcn/ui yang terhubung ke kolom allow_custom_design.

Sebuah komponen multi-select atau daftar checkbox untuk memilih DesignTemplate yang tersedia dan menghubungkannya dengan produk.

Pastikan data designTemplates yang ada dan semua designTemplates yang tersedia dilempar dari ProductController@edit dan ProductController@create.

Langkah 2.3: Perbarui Logika Penyimpanan di ProductController
Di dalam app/Features/Product/ProductController.php, modifikasi method store() dan update() untuk menangani sinkronisasi relasi designTemplates:

// Di dalam blok DB::transaction() setelah produk dibuat atau diupdate:
if ($request->has('design_templates')) {
    $product->designTemplates()->sync($request->input('design_templates', []));
}

FASE 3: Implementasi Sisi Customer
Langkah 3.1: Perbarui ProductDetailController
Buka app/Http/Controllers/ProductDetailController.php. Di dalam method __invoke() atau show(), pastikan Anda melakukan eager load terhadap relasi designTemplates yang baru.

// Ubah baris load menjadi seperti ini:
$product->load('category', 'attributeValues.attribute', 'designTemplates');

Langkah 3.2: Refactor Total Halaman Product/Show.tsx
Buka resources/js/Pages/Product/Show.tsx. Ganti seluruh isinya dengan kode yang ada di design-brief-product-page.md untuk mengimplementasikan UI/UX baru yang mencakup pemilihan opsi desain.

Selesai.

