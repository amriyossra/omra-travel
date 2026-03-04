<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Reservation extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * Les attributs qui sont assignables en masse.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        // Relations
        'user_id',
        'pack_id',

        // Informations personnelles
        'nom',
        'prenom',
        'email',
        'telephone',
        'date_naissance',
        'lieu_naissance',
        'nationalite',
        'passeport_numero',
        'passeport_expiration',

        // Adresse
        'adresse',
        'code_postal',
        'ville',
        'pays',

        // Détails réservation
        'nombre_personnes',
        'nombre_chambres',
        'accompagnants',

        // Options
        'assurance',
        'visa',
        'transport_local',
        'guide_prive',
        'demandes_speciales',

        // Préférences
        'type_chambre',
        'regime_alimentaire',
        'regime_alimentaire_autre',

        // Médical
        'probleme_sante',
        'informations_medicales',

        // Paiement
        'prix_total',
        'acompte',
        'statut_paiement',
        'mode_paiement',
        'reference_paiement',

        // Statut
        'statut',
        'date_depart',
        'date_retour',
        'date_confirmation',
        'date_annulation',

        // Notes
        'notes_agent',
        'notes_pelerin',

        // Métadonnées
        'code_reservation',
        'metadata',
    ];

    /**
     * Les attributs qui doivent être convertis.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'date_naissance' => 'date',
        'passeport_expiration' => 'date',
        'date_depart' => 'date',
        'date_retour' => 'date',
        'date_confirmation' => 'datetime',
        'date_annulation' => 'datetime',
        'assurance' => 'boolean',
        'visa' => 'boolean',
        'transport_local' => 'boolean',
        'guide_prive' => 'boolean',
        'probleme_sante' => 'boolean',
        'accompagnants' => 'array',
        'metadata' => 'array',
        'prix_total' => 'decimal:2',
        'acompte' => 'decimal:2',
        'nombre_personnes' => 'integer',
        'nombre_chambres' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * Les attributs à ajouter aux tableaux JSON.
     *
     * @var array<int, string>
     */
    protected $appends = [
        'nom_complet',
        'montant_restant',
        'statut_libelle',
        'statut_paiement_libelle',
    ];

    /**
     * Boot method du modèle.
     */
    protected static function boot()
    {
        parent::boot();

        // Générer un code de réservation unique à la création
        static::creating(function ($reservation) {
            $reservation->code_reservation = $reservation->code_reservation ?? self::generateUniqueCode();
        });

        // Calculer le prix total avant sauvegarde
        static::saving(function ($reservation) {
            if (!$reservation->prix_total && $reservation->pack) {
                $reservation->prix_total = $reservation->pack->prix * $reservation->nombre_personnes;
            }
        });
    }

    /**
     * Génère un code de réservation unique.
     *
     * @return string
     */
    public static function generateUniqueCode(): string
    {
        $prefix = 'OMRA';
        $date = now()->format('Ymd');
        $random = strtoupper(Str::random(6));
        $code = $prefix . '-' . $date . '-' . $random;

        // Vérifier l'unicité
        while (self::where('code_reservation', $code)->exists()) {
            $random = strtoupper(Str::random(6));
            $code = $prefix . '-' . $date . '-' . $random;
        }

        return $code;
    }

    // ============ RELATIONS ============

    /**
     * Relation avec l'utilisateur (pèlerin).
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relation avec le pack réservé.
     */
    public function pack()
    {
        return $this->belongsTo(Pack::class);
    }

    // ============ SCOPES ============

    /**
     * Scope pour les réservations en attente.
     */
    public function scopeEnAttente($query)
    {
        return $query->where('statut', 'en_attente');
    }

    /**
     * Scope pour les réservations confirmées.
     */
    public function scopeConfirmees($query)
    {
        return $query->where('statut', 'confirmee');
    }

    /**
     * Scope pour les réservations annulées.
     */
    public function scopeAnnulees($query)
    {
        return $query->where('statut', 'annulee');
    }

    /**
     * Scope pour les réservations d'un pèlerin.
     */
    public function scopeOfPelerin($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope pour les réservations d'un agent.
     */
    public function scopeOfAgent($query, $agentId)
    {
        return $query->whereHas('pack', function ($q) use ($agentId) {
            $q->where('user_id', $agentId);
        });
    }

    // ============ ACCESSORS ============

    /**
     * Obtenir le nom complet du pèlerin.
     */
    public function getNomCompletAttribute(): string
    {
        return trim($this->prenom . ' ' . $this->nom);
    }

    /**
     * Obtenir le montant restant à payer.
     */
    public function getMontantRestantAttribute(): float
    {
        return $this->prix_total - ($this->acompte ?? 0);
    }

    /**
     * Obtenir le libellé du statut.
     */
    public function getStatutLibelleAttribute(): string
    {
        return match ($this->statut) {
            'en_attente' => 'En attente',
            'confirmee' => 'Confirmée',
            'en_cours' => 'En cours',
            'terminee' => 'Terminée',
            'annulee' => 'Annulée',
            'remboursee' => 'Remboursée',
            default => 'Inconnu',
        };
    }

    /**
     * Obtenir le libellé du statut de paiement.
     */
    public function getStatutPaiementLibelleAttribute(): string
    {
        return match ($this->statut_paiement) {
            'en_attente' => 'En attente',
            'partiel' => 'Acompte versé',
            'paye' => 'Payé',
            'rembourse' => 'Remboursé',
            default => 'Inconnu',
        };
    }

    /**
     * Obtenir la couleur du statut pour l'UI.
     */
    public function getStatutCouleurAttribute(): string
    {
        return match ($this->statut) {
            'en_attente' => 'warning',
            'confirmee' => 'success',
            'en_cours' => 'info',
            'terminee' => 'primary',
            'annulee' => 'danger',
            'remboursee' => 'secondary',
            default => 'dark',
        };
    }

    /**
     * Obtenir l'icône du statut.
     */
    public function getStatutIconeAttribute(): string
    {
        return match ($this->statut) {
            'en_attente' => 'time-outline',
            'confirmee' => 'checkmark-circle-outline',
            'en_cours' => 'airplane-outline',
            'terminee' => 'ribbon-outline',
            'annulee' => 'close-circle-outline',
            'remboursee' => 'cash-outline',
            default => 'help-circle-outline',
        };
    }

    // ============ MUTATORS ============

    /**
     * Formater le téléphone avant sauvegarde.
     */
    public function setTelephoneAttribute($value)
    {
        $this->attributes['telephone'] = preg_replace('/[^0-9+]/', '', $value);
    }

    /**
     * Formater le passeport en majuscules.
     */
    public function setPasseportNumeroAttribute($value)
    {
        $this->attributes['passeport_numero'] = $value ? strtoupper($value) : null;
    }

    /**
     * Formater le code postal.
     */
    public function setCodePostalAttribute($value)
    {
        $this->attributes['code_postal'] = $value ? preg_replace('/[^0-9]/', '', $value) : null;
    }

    // ============ MÉTHODES ============

    /**
     * Confirmer une réservation.
     */
    public function confirmer(?string $notes = null): bool
    {
        $this->statut = 'confirmee';
        $this->date_confirmation = now();
        $this->notes_agent = $notes ?? $this->notes_agent;

        if ($this->statut_paiement === 'en_attente') {
            $this->statut_paiement = 'partiel';
        }

        return $this->save();
    }

    /**
     * Annuler une réservation.
     */
    public function annuler(?string $motif = null): bool
    {
        $this->statut = 'annulee';
        $this->date_annulation = now();
        $this->notes_agent = $motif ?? $this->notes_agent;
        return $this->save();
    }

    /**
     * Marquer comme payé.
     */
    public function marquerPaye(string $modePaiement, ?string $reference = null): bool
    {
        $this->statut_paiement = 'paye';
        $this->mode_paiement = $modePaiement;
        $this->reference_paiement = $reference ?? $this->reference_paiement;
        $this->acompte = $this->prix_total;
        return $this->save();
    }

    /**
     * Ajouter un acompte.
     */
    public function ajouterAcompte(float $montant, string $modePaiement, ?string $reference = null): bool
    {
        $this->acompte = ($this->acompte ?? 0) + $montant;
        $this->mode_paiement = $modePaiement;
        $this->reference_paiement = $reference ?? $this->reference_paiement;

        if ($this->acompte >= $this->prix_total) {
            $this->statut_paiement = 'paye';
        } else {
            $this->statut_paiement = 'partiel';
        }

        return $this->save();
    }

    /**
     * Vérifier si la réservation est modifiable.
     */
    public function isModifiable(): bool
    {
        return in_array($this->statut, ['en_attente', 'confirmee']);
    }

    /**
     * Vérifier si la réservation est annulable.
     */
    public function isAnnulable(): bool
    {
        return in_array($this->statut, ['en_attente', 'confirmee']);
    }
    /**
 * Relation avec les documents
 */
public function documents()
{
    return $this->hasMany(Document::class);
}

}
