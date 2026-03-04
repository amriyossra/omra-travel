<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens; // <-- ajouter
use Illuminate\Notifications\Notifiable;

class Admin extends Authenticatable
{
    use HasApiTokens, Notifiable; // <-- ajouter

    protected $fillable = [
        'prenom', 'nom', 'email', 'password'
    ];

    protected $hidden = [
        'password', 'remember_token',
    ];
}
