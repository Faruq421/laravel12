<?php

namespace Database\Seeders;

use App\Features\Product\Category;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // 1. Buat Kategori Induk (Parent) terlebih dahulu
        $parentElektronik = Category::create([
            'name' => 'Elektronik',
            'slug' => Str::slug('Elektronik'),
        ]);

        $parentMebel = Category::create([
            'name' => 'Mebel',
            'slug' => Str::slug('Mebel'),
        ]);

        // 2. Buat Kategori Anak (Child) dengan merujuk ke ID Induk

        // Anak dari Elektronik
        Category::create([
            'name' => 'Peralatan Dapur',
            'slug' => Str::slug('Peralatan Dapur'),
            'parent_id' => $parentElektronik->id,
        ]);

        Category::create([
            'name' => 'Lampu & Pencahayaan',
            'slug' => Str::slug('Lampu & Pencahayaan'),
            'parent_id' => $parentElektronik->id,
        ]);

        // Anak dari Mebel
        Category::create([
            'name' => 'Dekorasi Rumah',
            'slug' => Str::slug('Dekorasi Rumah'),
            'parent_id' => $parentMebel->id,
        ]);

        Category::create([
            'name' => 'Furnitur Ruang Tamu',
            'slug' => Str::slug('Furnitur Ruang Tamu'),
            'parent_id' => $parentMebel->id,
        ]);
    }
}

