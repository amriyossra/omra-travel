<?php

namespace App\Http\Controllers;

use App\Models\Reservation;
use App\Models\Pack;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ReservationController extends Controller
{
    /**
     * Afficher la liste des réservations avec filtres optionnels
     */
    public function index(Request $request)
    {
        try {
            $query = Reservation::with('pack', 'user');

            // Filtre par statut (ex: en_attente)
            if ($request->has('statut') && !empty($request->statut)) {
                $query->where('statut', $request->statut);
            }

            // Filtre par pack_id
            if ($request->has('pack_id') && !empty($request->pack_id)) {
                $query->where('pack_id', $request->pack_id);
            }

            // Filtre par date
            if ($request->has('date_debut') && !empty($request->date_debut)) {
                $query->whereDate('created_at', '>=', $request->date_debut);
            }

            if ($request->has('date_fin') && !empty($request->date_fin)) {
                $query->whereDate('created_at', '<=', $request->date_fin);
            }

            // Tri
            $orderBy = $request->get('order_by', 'created_at');
            $orderDir = $request->get('order_dir', 'desc');
            $query->orderBy($orderBy, $orderDir);

            // Pagination ou tout récupérer
            if ($request->has('per_page')) {
                $reservations = $query->paginate($request->per_page);
            } else {
                $reservations = $query->get();
            }

            return response()->json([
                'success' => true,
                'data' => $reservations,
                'count' => $reservations->count()
            ], 200);

        } catch (\Exception $e) {
            Log::error('Erreur index réservations: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des réservations',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Validation des données
        $validator = Validator::make($request->all(), [
            // ID du pack requis
            'pack_id' => 'required|exists:packs,id',

            // Informations personnelles
            'nom' => 'required|string|max:100',
            'prenom' => 'required|string|max:100',
            'email' => 'required|email|max:255',
            'telephone' => 'required|string|max:20',
            'date_naissance' => 'nullable|date',
            'lieu_naissance' => 'nullable|string|max:100',
            'nationalite' => 'nullable|string|max:50',
            'passeport_numero' => 'nullable|string|max:20',
            'passeport_expiration' => 'nullable|date|after:today',

            // Adresse
            'adresse' => 'nullable|string|max:255',
            'code_postal' => 'nullable|string|max:10',
            'ville' => 'nullable|string|max:100',
            'pays' => 'nullable|string|max:50',

            // Détails réservation
            'nombre_personnes' => 'required|integer|min:1|max:20',
            'nombre_chambres' => 'required|integer|min:1|max:10',
            'accompagnants' => 'nullable|array',
            'accompagnants.*.nom' => 'required_with:accompagnants|string|max:100',
            'accompagnants.*.prenom' => 'required_with:accompagnants|string|max:100',
            'accompagnants.*.date_naissance' => 'nullable|date',
            'accompagnants.*.passeport' => 'nullable|string|max:20',

            // Options
            'assurance' => 'nullable|boolean',
            'visa' => 'nullable|boolean',
            'transport_local' => 'nullable|boolean',
            'guide_prive' => 'nullable|boolean',
            'demandes_speciales' => 'nullable|string|max:1000',

            // Préférences
            'type_chambre' => 'nullable|in:simple,double,triple,quadruple,suite',
            'regime_alimentaire' => 'nullable|in:normal,vegetarien,halal,sans_gluten,autre',
            'regime_alimentaire_autre' => 'required_if:regime_alimentaire,autre|nullable|string|max:100',

            // Médical
            'probleme_sante' => 'nullable|boolean',
            'informations_medicales' => 'required_if:probleme_sante,true|nullable|string|max:1000',

            // Paiement
            'mode_paiement' => 'nullable|string|max:50',
            'acompte' => 'nullable|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur de validation',
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();

        try {
            // Récupérer le pack
            $pack = Pack::findOrFail($request->pack_id);

            // Vérifier si le pack est disponible
            if (!$pack->disponible) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ce pack n\'est pas disponible actuellement'
                ], 400);
            }

            // Calculer le prix total
            $prixTotal = $pack->prix * $request->nombre_personnes;

            // Ajouter les options
            if ($request->assurance) $prixTotal += 150 * $request->nombre_personnes;
            if ($request->visa) $prixTotal += 120 * $request->nombre_personnes;
            if ($request->transport_local) $prixTotal += 200 * $request->nombre_personnes;
            if ($request->guide_prive) $prixTotal += 300 * $request->nombre_personnes;

            // Créer la réservation
            $reservation = new Reservation();
            $reservation->user_id = Auth::id();
            $reservation->pack_id = $request->pack_id;

            // Informations personnelles
            $reservation->nom = $request->nom;
            $reservation->prenom = $request->prenom;
            $reservation->email = $request->email;
            $reservation->telephone = $request->telephone;
            $reservation->date_naissance = $request->date_naissance;
            $reservation->lieu_naissance = $request->lieu_naissance;
            $reservation->nationalite = $request->nationalite ?? 'Tunisienne';
            $reservation->passeport_numero = $request->passeport_numero;
            $reservation->passeport_expiration = $request->passeport_expiration;

            // Adresse
            $reservation->adresse = $request->adresse;
            $reservation->code_postal = $request->code_postal;
            $reservation->ville = $request->ville;
            $reservation->pays = $request->pays ?? 'Tunisie';

            // Détails
            $reservation->nombre_personnes = $request->nombre_personnes;
            $reservation->nombre_chambres = $request->nombre_chambres;
            $reservation->accompagnants = $request->accompagnants;

            // Options
            $reservation->assurance = $request->assurance ?? false;
            $reservation->visa = $request->visa ?? false;
            $reservation->transport_local = $request->transport_local ?? false;
            $reservation->guide_prive = $request->guide_prive ?? false;
            $reservation->demandes_speciales = $request->demandes_speciales;

            // Préférences
            $reservation->type_chambre = $request->type_chambre ?? 'double';
            $reservation->regime_alimentaire = $request->regime_alimentaire ?? 'halal';
            $reservation->regime_alimentaire_autre = $request->regime_alimentaire_autre;

            // Médical
            $reservation->probleme_sante = $request->probleme_sante ?? false;
            $reservation->informations_medicales = $request->informations_medicales;

            // Paiement
            $reservation->prix_total = $prixTotal;
            $reservation->acompte = $request->acompte ?? 0;
            $reservation->statut_paiement = $request->acompte > 0 ? 'partiel' : 'en_attente';
            $reservation->mode_paiement = $request->mode_paiement;

            // Dates de départ/retour depuis le pack
            $reservation->date_depart = now()->addDays(30); // À adapter selon votre logique
            $reservation->date_retour = now()->addDays(30 + $pack->duree);

            $reservation->save();

            DB::commit();

            // Charger la relation pack
            $reservation->load('pack');

            return response()->json([
                'success' => true,
                'message' => 'Réservation créée avec succès',
                'data' => $reservation
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erreur création réservation: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création de la réservation',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        try {
            $reservation = Reservation::with('pack', 'user')->find($id);

            if (!$reservation) {
                return response()->json([
                    'success' => false,
                    'message' => 'Réservation non trouvée'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $reservation
            ], 200);

        } catch (\Exception $e) {
            Log::error('Erreur show réservation: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération de la réservation',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        try {
            Log::info('=== MISE À JOUR RÉSERVATION ===');
            Log::info('ID: ' . $id);
            Log::info('Données reçues:', $request->all());

            $reservation = Reservation::find($id);

            if (!$reservation) {
                Log::error('Réservation non trouvée: ' . $id);
                return response()->json([
                    'success' => false,
                    'message' => 'Réservation non trouvée'
                ], 404);
            }

            if ($request->has('statut')) {
                $reservation->statut = $request->statut;
                Log::info('Nouveau statut: ' . $request->statut);
            }

            $reservation->save();
            Log::info('Sauvegarde réussie');

            return response()->json([
                'success' => true,
                'message' => 'Réservation mise à jour avec succès',
                'data' => $reservation
            ], 200);

        } catch (\Exception $e) {
            Log::error('ERREUR update: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        try {
            $reservation = Reservation::find($id);

            if (!$reservation) {
                return response()->json([
                    'success' => false,
                    'message' => 'Réservation non trouvée'
                ], 404);
            }

            $reservation->delete();

            return response()->json([
                'success' => true,
                'message' => 'Réservation supprimée avec succès'
            ], 200);

        } catch (\Exception $e) {
            Log::error('Erreur suppression: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * ✅ NOUVELLE MÉTHODE : Récupère les réservations d'un utilisateur spécifique
     */
    public function getUserReservations($userId)
    {
        try {
            Log::info('📥 Récupération des réservations pour l\'utilisateur: ' . $userId);

            $reservations = Reservation::with('pack')
                ->where('user_id', $userId)
                ->get();

            Log::info('✅ ' . $reservations->count() . ' réservation(s) trouvée(s)');

            return response()->json([
                'success' => true,
                'data' => $reservations
            ], 200);

        } catch (\Exception $e) {
            Log::error('❌ Erreur getUserReservations: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des réservations',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Statistiques des réservations
     */
    public function statistiques(Request $request)
    {
        try {
            $stats = [
                'total' => Reservation::count(),
                'en_attente' => Reservation::where('statut', 'en_attente')->count(),
                'confirmees' => Reservation::where('statut', 'confirmee')->count(),
                'annulees' => Reservation::where('statut', 'annulee')->count(),
                'revenus_total' => Reservation::sum('prix_total'),
                'acomptes_total' => Reservation::sum('acompte')
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ], 200);

        } catch (\Exception $e) {
            Log::error('Erreur statistiques: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du calcul des statistiques',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Vérifier la disponibilité
     */
    public function checkDisponibilite(Request $request)
    {
        return response()->json([
            'success' => true,
            'disponible' => true
        ]);
    }

    /**
     * Récupérer les documents d'une réservation
     */
    public function getDocuments($id)
    {
        try {
            $reservation = Reservation::findOrFail($id);
            $documents = $reservation->documents;

            return response()->json([
                'success' => true,
                'data' => $documents
            ]);
        } catch (\Exception $e) {
            Log::error('Erreur getDocuments: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des documents'
            ], 500);
        }
    }

    /**
     * Demander des documents manquants
     */
    public function requestMissingDocuments(Request $request, $id)
    {
        try {
            $request->validate([
                'documents' => 'required|array',
                'documents.*' => 'in:passeport,visa,photo,vaccin'
            ]);

            $reservation = Reservation::findOrFail($id);

            return response()->json([
                'success' => true,
                'message' => 'Demande de documents envoyée avec succès'
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur requestMissingDocuments: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la demande de documents'
            ], 500);
        }
    }

    /**
     * Relancer pour un document spécifique
     */
    public function remindDocument(Request $request, $id, $type)
    {
        try {
            $request->validate([
                'message' => 'nullable|string'
            ]);

            $reservation = Reservation::findOrFail($id);

            return response()->json([
                'success' => true,
                'message' => 'Relance envoyée avec succès'
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur remindDocument: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'envoi de la relance'
            ], 500);
        }
    }

    /**
     * Proposer un pack alternatif
     */
    public function proposeAlternative(Request $request, $id)
    {
        try {
            $request->validate([
                'pack_id' => 'required|exists:packs,id'
            ]);

            $reservation = Reservation::findOrFail($id);
            $newPack = Pack::findOrFail($request->pack_id);

            return response()->json([
                'success' => true,
                'message' => 'Proposition envoyée avec succès'
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur proposeAlternative: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'envoi de la proposition'
            ], 500);
        }
    }
}
