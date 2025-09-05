<?php

namespace App\Features\Product;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    // SYNC_FILLABLE_START
    protected $fillable = [
        'name',
        'slug',
        'sku',
        'description',
        'price',
        'stock',
        'category_id',
        'weight',
        'specifications',
        'is_featured',
        'is_published'
    ];
    // SYNC_FILLABLE_END
    
    // SYNC_CASTS_START
    protected $casts = [
        'specifications' => 'array',
        'price' => 'decimal:2',
        'specifications' => 'array',
        'is_featured' => 'boolean',
        'is_published' => 'boolean',
    ];
    // SYNC_CASTS_END

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class);
    }
}
