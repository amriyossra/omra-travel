<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\Reservation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class DocumentController extends Controller
{
    /**
     * Upload d'un document
     */
    public function upload(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'reservation_id' => 'required|exists:reservations,id',
            'type' => 'required|in:passeport,visa,photo,autre',
            'fichier' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120' // 5MB max
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur de validation',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $file = $request->file('fichier');
            $reservationId = $request->reservation_id;
            $type = $request->type;

            // Générer un nom unique
            $fileName = time() . '_' . $type . '_' . $file->getClientOriginalName();

            // Stocker le fichier
            $path = $file->storeAs('documents/' . $reservationId, $fileName, 'public');

            // Créer l'entrée en base
            $document = Document::create([
                'reservation_id' => $reservationId,
                'type' => $type,
                'nom_fichier' => $fileName,
                'chemin_fichier' => $path,
                'taille' => $file->getSize(),
                'mime_type' => $file->getMimeType(),
                'statut' => 'en_attente'
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Document uploadé avec succès',
                'data' => $document
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'upload',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Récupérer tous les documents d'une réservation
     */
    public function getByReservation($reservationId)
    {
        $documents = Document::where('reservation_id', $reservationId)->get();

        return response()->json([
            'success' => true,
            'data' => $documents
        ]);
    }

    /**
     * Télécharger un document
     */
    public function download($id)
    {
        $document = Document::findOrFail($id);

        if (!Storage::disk('public')->exists($document->chemin_fichier)) {
            return response()->json([
                'success' => false,
                'message' => 'Fichier non trouvé'
            ], 404);
        }

        return Storage::disk('public')->download($document->chemin_fichier, $document->nom_fichier);
    }

    /**
     * Valider ou rejeter un document (pour l'agent)
     */
    public function valider(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'statut' => 'required|in:valide,rejete',
            'commentaire' => 'nullable|string|max:500'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $document = Document::findOrFail($id);
        $document->statut = $request->statut;
        $document->commentaire = $request->commentaire;
        $document->save();

        return response()->json([
            'success' => true,
            'message' => 'Document mis à jour',
            'data' => $document
        ]);
    }

    /**
     * Supprimer un document
     */
    public function destroy($id)
    {
        $document = Document::findOrFail($id);

        // Supprimer le fichier physique
        Storage::disk('public')->delete($document->chemin_fichier);

        // Supprimer l'entrée en base
        $document->delete();

        return response()->json([
            'success' => true,
            'message' => 'Document supprimé'
        ]);
    }
}
