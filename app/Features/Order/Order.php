<?php

namespace App\Features\Order;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'order_status',
        'total_price',
        'shipping_address',
        'shipping_cost',
        'shipping_method',
        'payment_method',
        'payment_status',
        'tracking_number',
        'estimated_completion_date',
        'admin_notes',
        // Midtrans payment fields
        'snap_token',
        'midtrans_order_id',
        'transaction_id',
        'payment_time',
    ];

    protected $casts = [
        'shipping_address' => 'array',
        'estimated_completion_date' => 'date',
        'payment_time' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function reviews()
    {
        return $this->hasMany(\App\Features\Review\Review::class);
    }
}