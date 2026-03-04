<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens; // <-- important
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable; // <-- HasApiTokens ajouté

    protected $fillable = [
        'civilite', 'prenom', 'nom', 'email', 'telephone', 'adresse', 'ville', 'pays', 'password'
    ];

    protected $hidden = [
        'password', 'remember_token',
    ];
    public function demandesPersonnalisees()
{
    return $this->hasMany(DemandePersonnalisee::class);
}
}
