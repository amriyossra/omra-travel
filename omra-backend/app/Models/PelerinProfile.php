<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PelerinProfile extends Model
{
    protected $fillable = [
        'user_id',
        'phone',
        'passport_number',
        'passport_expiry',
        'omra_type',
        'hotel_type',
        'travel_type',
        'budget',
        'period'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
