<?php

namespace App\Features\Product;

use App\Features\Product\Category;
use App\Features\Product\AttributeValue; // Saya tambahkan ini untuk kelengkapan
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage; // <-- Tambahan dari saya
use Illuminate\Support\Str; // <-- Tambahkan ini

class Product extends Model
{
    use HasFactory;

    protected $primaryKey = 'id_produk';

    protected $fillable = [
        'nama_produk',
        'slug', // <-- Tambahkan slug
        'deskripsi',
        'harga',
        'stok',
        'gambar',
        'category_id',
        'status',
        'allow_custom_design',
        'enable_design_feature',
    ];
    /**
     *  Setup model event hooks
     */
    protected static function booted(): void
    {
        static::creating(function (Product $product) {
            $product->slug = static::generateUniqueSlug($product->nama_produk);
        });

        static::updating(function (Product $product) {
            if ($product->isDirty('nama_produk')) {
                $product->slug = static::generateUniqueSlug($product->nama_produk, $product->id_produk);
            }
        });
    }

    /**
     * Generate a unique slug for the product.
     * If the slug already exists, append a numeric suffix (-1, -2, etc.)
     *
     * @param string $name
     * @param int|null $excludeId Product ID to exclude when checking (for updates)
     * @return string
     */
    protected static function generateUniqueSlug(string $name, ?int $excludeId = null): string
    {
        $slug = Str::slug($name);
        $originalSlug = $slug;
        $counter = 1;

        // Query to check for existing slugs
        $query = static::where('slug', $slug);

        // Exclude the current product when updating
        if ($excludeId !== null) {
            $query->where('id_produk', '!=', $excludeId);
        }

        // Keep incrementing the counter until we find a unique slug
        while ($query->exists()) {
            $slug = $originalSlug . '-' . $counter;
            $counter++;

            // Reset query for the new slug
            $query = static::where('slug', $slug);
            if ($excludeId !== null) {
                $query->where('id_produk', '!=', $excludeId);
            }
        }

        return $slug;
    }

    /**
     * Get the route key for the model.
     *
     * @return string
     */
    public function getRouteKeyName()
    {
        return 'slug';
    }

    protected $casts = [
        'status' => 'boolean',
        'allow_custom_design' => 'boolean',
        'enable_design_feature' => 'boolean',
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

    public function designTemplates()
    {
        return $this->belongsToMany(
            \App\Features\DesignTemplate\DesignTemplate::class,
            'product_design_template',
            'product_id_produk',
            'design_template_id'
        );
    }
}
