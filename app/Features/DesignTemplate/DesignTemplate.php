<?php

namespace App\Features\DesignTemplate;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DesignTemplate extends Model
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
        'thumbnail_path',
        'file_path',
    ];
    // SYNC_FILLABLE_END

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    // SYNC_CASTS_START
    protected $casts = [
        'status' => 'boolean',
    ];
    // SYNC_CASTS_END

    public function products()
    {
        return $this->belongsToMany(
            \App\Features\Product\Product::class,
            'product_design_template',
            'design_template_id',
            'product_id_produk'
        );
    }
}
