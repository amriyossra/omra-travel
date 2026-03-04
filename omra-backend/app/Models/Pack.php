<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class Pack extends Model
{
    use HasFactory;

    protected $fillable = [
        'titre',
        'description',
        'prix',
        'duree',
        'hotel',
        'transport',
        'services',
        'disponible',
        'reservations',
        'reservation_trend',
        'user_id'
    ];

    protected $casts = [
        'disponible' => 'boolean',
        'prix' => 'decimal:2',
        'reservations' => 'integer',
        'reservation_trend' => 'integer'
    ];

    // Agent relation
    public function user()
    {
        return $this->belongsTo(User::class);
    }
    public function reservations() {
    return $this->hasMany(Reservation::class);
}
}
