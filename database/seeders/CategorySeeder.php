<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Features\Product\Category; // Pastikan untuk mengimpor model Category

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            'Digital Printing',
            'Sticker',
            'NameCard & Invitation',
            'Display Promotion',
            'Large Format',
            'Garment & Textile',
            'Stationary',
            'Merchandise',
            'Packaging',
            'Home Decor & Photo',
        ];

        foreach ($categories as $category) {
            Category::create(['name' => $category]);
        }
    }
}
