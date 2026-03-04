<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens; // <-- ajouter
use Illuminate\Notifications\Notifiable;

class Agent extends Authenticatable
{
    use HasApiTokens, Notifiable; // <-- ajouter

    protected $fillable = [
        'nom_agence', 'prenom', 'nom', 'email', 'telephone', 'access_code', 'password'
    ];

    protected $hidden = [
        'password', 'remember_token',
    ];
}
