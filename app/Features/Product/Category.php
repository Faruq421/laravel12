<?php

namespace App\Features\Product;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Category extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    // Relasi ke Produk (yang sudah ada)
    public function products()
    {
        return $this->hasMany(Product::class);
    }

    // TAMBAHKAN RELASI DI BAWAH INI

    /**
     * Mendapatkan data induk dari sebuah kategori.
     */
    public function parent()
    {
        return $this->belongsTo(Category::class, 'parent_id');
    }

    /**
     * Mendapatkan semua data anak dari sebuah kategori.
     */
    public function children()
    {
        return $this->hasMany(Category::class, 'parent_id');
    }
}
