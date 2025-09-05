<?php

namespace App\Features\Customer;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class Customer extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    // SYNC_FILLABLE_START
    protected $fillable = [
        'user_id',
        'phone_number',
        'address',
        'city',
        'province'
    ];
    // SYNC_FILLABLE_END

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    // SYNC_CASTS_START
    protected $casts = [

    ];
    // SYNC_CASTS_END

    public function user() {
        return $this->belongsTo(User::class);
    }
}
