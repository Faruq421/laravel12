<?php

namespace App\Features\Product;

use App\Features\Product\Category;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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

    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    // ... (kode lainnya di Product.php)

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
        )->withPivot('price'); // <-- TAMBAHKAN BARIS INI
    }
}
