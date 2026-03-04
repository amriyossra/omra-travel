<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DemandePersonnalisee extends Model
{
    protected $table = 'demandes_personnalisees';

    protected $fillable = [
        'user_id',
        'nombre_personnes',
        'duree',
        'date_depart',
        'ville_depart',
        'hotel_makkah',
        'hotel_medina',
        'type_chambre',
        'visa',
        'assurance',
        'transport_local',
        'guide_prive',
        'repas_inclus',
        'zamzam',
        'budget',
        'mode_paiement',
        'demandes_speciales',
        'statut'
    ];

    protected $casts = [
        'visa' => 'boolean',
        'assurance' => 'boolean',
        'transport_local' => 'boolean',
        'guide_prive' => 'boolean',
        'repas_inclus' => 'boolean',
        'zamzam' => 'boolean',
        'date_depart' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
