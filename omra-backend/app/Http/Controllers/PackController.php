<?php

namespace App\Http\Controllers;
use App\Models\Pack;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PackController extends Controller
{
    /**
     * Packs de l'agent connecté
     */
    public function index()
    {
        try {
            $packs = Pack::where('user_id', Auth::id())
                        ->orderBy('created_at', 'desc')
                        ->get();

            return response()->json([
                'success' => true,
                'data' => $packs
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des packs',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * 🔥 Packs visibles pour le pèlerin
     */
   public function publicPacks()
{
    try {
        $packs = Pack::where('disponible', true)
            ->with(['user' => function($query) {
                // Sélectionne les colonnes existantes dans ta table users
                $query->select('id', 'prenom', 'nom', 'email');
            }])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function($pack) {
                // S'assure que chaque pack a un agent associé
                if (!$pack->user) {
                    $pack->user = [
                        'id' => null,
                        'prenom' => 'Agent',
                        'nom' => 'inconnu',
                        'email' => null
                    ];
                }
                return $pack;
            });

        return response()->json([
            'success' => true,
            'data' => $packs
        ]);

    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Erreur lors de la récupération des packs publics',
            'error' => $e->getMessage()
        ], 500);
    }
}

    /**
     * Store pack (agent)
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'titre' => 'required|string|max:255',
                'description' => 'required|string|min:20',
                'prix' => 'required|numeric|min:100|max:50000',
                'duree' => 'required|integer|min:1|max:30',
                'hotel' => 'required|string|max:255',
                'transport' => 'required|string|max:255',
                'services' => 'required|string|min:10',
                'disponible' => 'boolean'
            ]);

            $validated['user_id'] = Auth::id();
            $validated['reservations'] = 0;
            $validated['reservation_trend'] = 0;

            $pack = Pack::create($validated);

            return response()->json([
                'success' => true,
                'message' => 'Pack créé avec succès',
                'data' => $pack
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création du pack',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update pack
     */
    public function update(Request $request, $id)
    {
        try {
            $pack = Pack::where('user_id', Auth::id())->findOrFail($id);

            $validated = $request->validate([
                'titre' => 'sometimes|string|max:255',
                'description' => 'sometimes|string|min:20',
                'prix' => 'sometimes|numeric|min:100|max:50000',
                'duree' => 'sometimes|integer|min:1|max:30',
                'hotel' => 'sometimes|string|max:255',
                'transport' => 'sometimes|string|max:255',
                'services' => 'sometimes|string|min:10',
                'disponible' => 'sometimes|boolean'
            ]);

            $pack->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Pack mis à jour avec succès',
                'data' => $pack
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete pack
     */
    public function destroy($id)
    {
        try {
            $pack = Pack::where('user_id', Auth::id())->findOrFail($id);
            $pack->delete();

            return response()->json([
                'success' => true,
                'message' => 'Pack supprimé avec succès'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
