<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\DemandePersonnalisee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DemandePersonnaliseeController extends Controller
{
    /**
     * Store a newly created resource in storage.
     */
     public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre_personnes' => 'required|integer|min:1|max:20',
            'duree' => 'required|integer|min:7|max:30',
            'date_depart' => 'required|date|after_or_equal:today',
            'ville_depart' => 'required|string|max:255',
            'hotel_makkah' => 'required|string|in:standard,confort,premium',
            'hotel_medina' => 'required|string|in:standard,confort,premium',
            'type_chambre' => 'required|string|in:quadruple,triple,double,simple',
            'visa' => 'boolean',
            'assurance' => 'boolean',
            'transport_local' => 'boolean',
            'guide_prive' => 'boolean',
            'repas_inclus' => 'boolean',
            'zamzam' => 'boolean',
            'budget' => 'nullable|numeric|min:0',
            'mode_paiement' => 'required|string|in:especes,carte,virement',
            'demandes_speciales' => 'nullable|string'
        ]);

        $demande = DemandePersonnalisee::create([
            'user_id' => Auth::id(),
            ...$validated
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Demande envoyée avec succès',
            'data' => $demande
        ], 201);
    }

    /**
     * Display a listing of the resource (pour les agents/admin).
     */
    public function index()
    {
        $this->authorize('viewAny', DemandePersonnalisee::class); // à implémenter si besoin

        $demandes = DemandePersonnalisee::with('user')->orderBy('created_at', 'desc')->get();
        return response()->json($demandes);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $demande = DemandePersonnalisee::with('user')->findOrFail($id);
        // Vérifier que l'utilisateur a le droit de voir (agent/admin ou propriétaire)
        if (auth()->id() !== $demande->user_id && !auth()->user()->isAgentOrAdmin()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }
        return response()->json($demande);
    }

    /**
     * Update the specified resource (changer statut par exemple).
     */
    public function update(Request $request, $id)
    {
        $demande = DemandePersonnalisee::findOrFail($id);
        // Seul un agent/admin peut mettre à jour le statut
        $this->authorize('update', $demande); // à implémenter

        $validated = $request->validate([
            'statut' => 'required|in:en_attente,traitee,convertie'
        ]);

        $demande->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Statut mis à jour',
            'data' => $demande
        ]);
    }

    /**
     * Remove the specified resource.
     */
    public function destroy($id)
    {
        $demande = DemandePersonnalisee::findOrFail($id);
        // Seul un admin peut supprimer
        $this->authorize('delete', $demande);

        $demande->delete();
        return response()->json(['success' => true, 'message' => 'Demande supprimée']);
    }
}
