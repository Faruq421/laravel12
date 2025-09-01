<?php

namespace App\Features\Product;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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
        'description',
        'price',
        'stock',
        'is_published'
    ];
    // SYNC_FILLABLE_END

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    // SYNC_CASTS_START
    protected $casts = [
        'price' => 'decimal:2',
    ];
    // SYNC_CASTS_END
}
