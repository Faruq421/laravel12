<?php

namespace App\Features\Product;

use App\Features\Product\Category;
use App\Features\Product\AttributeValue; // Saya tambahkan ini untuk kelengkapan
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage; // <-- Tambahan dari saya

class Product extends Model
{
    use HasFactory;

    protected $primaryKey = 'id_produk';

    protected $fillable = [
        'nama_produk',
        'deskripsi',
        'harga',
        'stok',
        'gambar',
        'category_id',
        'status',
    ];

    protected $casts = [
        'status' => 'boolean',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array
     */
    protected $appends = ['gambar_url']; // <-- Tambahan dari saya

    /**
     * Get the full URL for the product image.
     * Accessor ini akan membuat properti 'gambar_url' otomatis.
     *
     * @return string
     */
    public function getGambarUrlAttribute(): string
    {
        // Cek jika kolom 'gambar' tidak kosong dan filenya ada di storage
        if ($this->gambar && Storage::disk('public')->exists($this->gambar)) {
            // Jika ada, return URL lengkapnya (e.g., /storage/products/nama-file.jpg)
            return Storage::url($this->gambar);
        }

        // Jika tidak ada gambar, return URL placeholder
        return 'https://placehold.co/400x400/EFEFEF/AAAAAA?text=No+Image';
    }

    /**
     * Relasi ke Category
     */
    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    /**
     * Relasi Many-to-Many ke AttributeValue melalui tabel pivot.
     */
    public function attributeValues()
    {
        return $this->belongsToMany(
            AttributeValue::class,
            'product_attribute_value',
            'product_id_produk',
            'attribute_value_id'
        )->withPivot('price');
    }
}
