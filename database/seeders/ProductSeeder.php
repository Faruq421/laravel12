<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Features\Product\Product;
use App\Features\Product\Category;
use Illuminate\Support\Facades\DB;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Kosongkan tabel produk terlebih dahulu untuk menghindari duplikat
        DB::table('products')->delete();

        $categories = Category::pluck('id', 'name')->all();

        if (empty($categories)) {
            $this->command->info('Tidak ada kategori. Jalankan CategorySeeder terlebih dahulu.');
            return;
        }

        $products = [
            // Kategori: Digital Printing
            ['nama_produk' => 'Cetak Poster A3+ Art Paper', 'deskripsi' => 'Poster berkualitas tinggi dengan bahan Art Paper 150gr, cocok untuk promosi atau dekorasi.', 'harga' => 15000, 'stok' => 200, 'gambar' => 'https://images.unsplash.com/photo-1541848574321-3c2b1a26a575?w=500&q=80', 'category_id' => $categories['Digital Printing'], 'status' => true],
            ['nama_produk' => 'Flyer Promosi A5 (1 Rim)', 'deskripsi' => 'Sebar informasi bisnismu dengan flyer A5 berkualitas. Paket cetak 1 rim (500 lembar).', 'harga' => 150000, 'stok' => 50, 'gambar' => 'https://images.unsplash.com/photo-1587280501635-395d8b4b7f8f?w=500&q=80', 'category_id' => $categories['Digital Printing'], 'status' => true],

            // Kategori: Sticker
            ['nama_produk' => 'Stiker Vinyl Tahan Air (Lembar A3)', 'deskripsi' => 'Stiker vinyl anti air, sudah termasuk potong sesuai bentuk desain (kiss-cut).', 'harga' => 25000, 'stok' => 300, 'gambar' => 'https://images.unsplash.com/photo-1610935593122-d53c1f107934?w=500&q=80', 'category_id' => $categories['Sticker'], 'status' => true],
            ['nama_produk' => 'Stiker Label Produk Bulat (100 pcs)', 'deskripsi' => 'Label stiker bulat untuk kemasan produk Anda. Diameter 5cm, bahan chromo.', 'harga' => 35000, 'stok' => 400, 'gambar' => 'https://images.unsplash.com/photo-1596702951442-9a8a72836058?w=500&q=80', 'category_id' => $categories['Sticker'], 'status' => true],

            // Kategori: NameCard & Invitation
            ['nama_produk' => 'Kartu Nama Premium (100 pcs)', 'deskripsi' => 'Cetak 100 pcs kartu nama bahan Art Carton 260gr dengan laminasi Doff/Glossy.', 'harga' => 45000, 'stok' => 250, 'gambar' => 'https://images.unsplash.com/photo-1596526131019-e382e21941a7?w=500&q=80', 'category_id' => $categories['NameCard & Invitation'], 'status' => true],
            ['nama_produk' => 'Undangan Pernikahan Elegan', 'deskripsi' => 'Desain dan cetak undangan pernikahan eksklusif dengan bahan premium dan finishing foil.', 'harga' => 7500, 'stok' => 100, 'gambar' => 'https://images.unsplash.com/photo-1559030623-0226b3e18a43?w=500&q=80', 'category_id' => $categories['NameCard & Invitation'], 'status' => true],

            // Kategori: Display Promotion
            ['nama_produk' => 'Roll Up Banner Alumunium 60x160cm', 'deskripsi' => 'Paket lengkap Roll Up Banner, sudah termasuk cetak dan rangka alumunium kokoh.', 'harga' => 185000, 'stok' => 80, 'gambar' => 'https://images.unsplash.com/photo-1621990833918-97171ad2c713?w=500&q=80', 'category_id' => $categories['Display Promotion'], 'status' => true],
            ['nama_produk' => 'X Banner Fleksibel + Cetak', 'deskripsi' => 'X Banner indoor yang ringan dan mudah dipindahkan. Ukuran 60x160cm.', 'harga' => 95000, 'stok' => 90, 'gambar' => 'https://images.unsplash.com/photo-1621990833918-97171ad2c713?w=500&q=80', 'category_id' => $categories['Display Promotion'], 'status' => true],

            // Kategori: Large Format
            ['nama_produk' => 'Cetak Spanduk Flexi Outdoor', 'deskripsi' => 'Spanduk bahan Flexi tebal, tahan cuaca. Harga per meter persegi.', 'harga' => 28000, 'stok' => 150, 'gambar' => 'https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?w=500&q=80', 'category_id' => $categories['Large Format'], 'status' => true],
            ['nama_produk' => 'Cetak Backlight untuk Neonbox', 'deskripsi' => 'Bahan cetak khusus untuk neonbox agar menyala terang dan merata.', 'harga' => 85000, 'stok' => 100, 'gambar' => 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=500&q=80', 'category_id' => $categories['Large Format'], 'status' => true],

            // Kategori: Garment & Textile
            ['nama_produk' => 'Cetak Kaos DTF Satuan', 'deskripsi' => 'Cetak kaos custom dengan teknologi DTF. Bahan kaos Cotton Combed 30s.', 'harga' => 90000, 'stok' => 120, 'gambar' => 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&q=80', 'category_id' => $categories['Garment & Textile'], 'status' => true],
            ['nama_produk' => 'Topi Trucker Custom Logo', 'deskripsi' => 'Topi trucker dengan sablon logo atau tulisan. Pilihan warna topi beragam.', 'harga' => 55000, 'stok' => 180, 'gambar' => 'https://images.unsplash.com/photo-1588850561407-ed7273390e4f?w=500&q=80', 'category_id' => $categories['Garment & Textile'], 'status' => true],

            // Kategori: Stationary
            ['nama_produk' => 'Kalender Dinding Custom 2025', 'deskripsi' => 'Kalender dinding custom untuk promosi perusahaan. Finishing spiral.', 'harga' => 22000, 'stok' => 250, 'gambar' => 'https://images.unsplash.com/photo-1541848574321-3c2b1a26a575?w=500&q=80', 'category_id' => $categories['Stationary'], 'status' => true],
            ['nama_produk' => 'Buku Catatan A5 Hard Cover', 'deskripsi' => 'Buku catatan custom dengan hard cover dan logo perusahaan. Isi 100 lembar.', 'harga' => 65000, 'stok' => 130, 'gambar' => 'https://images.unsplash.com/photo-1456735180827-d1162f7d5d4a?w=500&q=80', 'category_id' => $categories['Stationary'], 'status' => true],

            // Kategori: Merchandise
            ['nama_produk' => 'Mug Custom Desain Suka-suka', 'deskripsi' => 'Cetak desain, foto, atau logo pada mug keramik. Sudah termasuk box.', 'harga' => 48000, 'stok' => 160, 'gambar' => 'https://images.unsplash.com/photo-1510626419024-e2a14b534676?w=500&q=80', 'category_id' => $categories['Merchandise'], 'status' => true],
            ['nama_produk' => 'Gantungan Kunci Akrilik', 'deskripsi' => 'Gantungan kunci bahan akrilik bening, bisa custom bentuk dan gambar.', 'harga' => 12000, 'stok' => 400, 'gambar' => 'https://images.unsplash.com/photo-1627933939675-380e25b0c79f?w=500&q=80', 'category_id' => $categories['Merchandise'], 'status' => true],
            ['nama_produk' => 'Pin Peniti Custom (5.8cm)', 'deskripsi' => 'Pin peniti untuk souvenir acara atau komunitas. Diameter 5.8cm, laminasi glossy.', 'harga' => 5000, 'stok' => 1000, 'gambar' => 'https://images.unsplash.com/photo-1634152964348-18c6a0531b7d?w=500&q=80', 'category_id' => $categories['Merchandise'], 'status' => true],

            // Kategori: Packaging
            ['nama_produk' => 'Paper Bag Custom Kraft', 'deskripsi' => 'Paper bag bahan kraft tebal dengan cetak logo. Tingkatkan citra brand Anda.', 'harga' => 8000, 'stok' => 300, 'gambar' => 'https://images.unsplash.com/photo-1594951944222-1f4a9b2b5133?w=500&q=80', 'category_id' => $categories['Packaging'], 'status' => true],
            ['nama_produk' => 'Dus Kemasan Produk Custom', 'deskripsi' => 'Cetak dus kemasan full color sesuai ukuran dan desain produk Anda.', 'harga' => 10000, 'stok' => 280, 'gambar' => 'https://images.unsplash.com/photo-1559523161-07f6a6ab7d98?w=500&q=80', 'category_id' => $categories['Packaging'], 'status' => true],

            // Kategori: Home Decor & Photo
            ['nama_produk' => 'Cetak Foto Kanvas + Frame', 'deskripsi' => 'Abadikan momen spesial Anda dalam cetakan kanvas berkualitas tinggi plus frame.', 'harga' => 175000, 'stok' => 70, 'gambar' => 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=500&q=80', 'category_id' => $categories['Home Decor & Photo'], 'status' => true],
            ['nama_produk' => 'Bantal Custom Foto 40x40cm', 'deskripsi' => 'Bantal sofa empuk dengan cetak foto atau desain favorit Anda.', 'harga' => 120000, 'stok' => 95, 'gambar' => 'https://images.unsplash.com/photo-1589830230690-8e1d5295c342?w=500&q=80', 'category_id' => $categories['Home Decor & Photo'], 'status' => true],
            ['nama_produk' => 'Wallpaper Dinding Custom', 'deskripsi' => 'Cetak wallpaper custom dengan desain atau gambar pilihan Anda. Harga per meter.', 'harga' => 220000, 'stok' => 60, 'gambar' => 'https://images.unsplash.com/photo-1501768412436-721251c4a2a1?w=500&q=80', 'category_id' => $categories['Home Decor & Photo'], 'status' => true],

            // Produk Tambahan
            ['nama_produk' => 'Cetak Brosur A4 Lipat 3', 'deskripsi' => 'Brosur promosi ukuran A4 dengan 3 lipatan, bahan Art Paper 120gr.', 'harga' => 5000, 'stok' => 500, 'gambar' => 'https://images.unsplash.com/photo-1606836576974-2183b3f28329?w=500&q=80', 'category_id' => $categories['Digital Printing'], 'status' => true],
            ['nama_produk' => 'ID Card Karyawan PVC', 'deskripsi' => 'Cetak ID Card bahan PVC tebal dan awet, setara kartu ATM. Cetak 2 sisi.', 'harga' => 20000, 'stok' => 350, 'gambar' => 'https://images.unsplash.com/photo-1554311891-b5d35a8553f1?w=500&q=80', 'category_id' => $categories['Stationary'], 'status' => true],
        ];

        // Masukkan data ke database
        foreach ($products as $productData) {
            Product::create($productData);
        }
    }
}
