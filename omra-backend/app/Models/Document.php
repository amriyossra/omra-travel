<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Document extends Model
{
    use HasFactory;

    protected $fillable = [
        'reservation_id',
        'type',
        'nom_fichier',
        'chemin_fichier',
        'taille',
        'mime_type',
        'statut',
        'commentaire'
    ];

    protected $casts = [
        'taille' => 'integer',
    ];

    public function reservation()
    {
        return $this->belongsTo(Reservation::class);
    }

}
