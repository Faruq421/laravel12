<?php

namespace App\Features\Product;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    protected $fillable = ['name'];

    /**
     * Mendefinisikan relasi "has many" ke model Product.
     */
    public function products()
    {
        return $this->hasMany(Product::class);
    }
}
