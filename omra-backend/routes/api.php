<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PackController;
use App\Http\Controllers\ReservationController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\DemandePersonnaliseeController; // <<< AJOUTER CET IMPORT

/*
|--------------------------------------------------------------------------
| Auth Routes
|--------------------------------------------------------------------------
*/

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// 🔥 Packs accessibles à tous les clients, même non connectés
Route::get('/pelerin/packs', [PackController::class, 'publicPacks']);

// Routes qui nécessitent authentification
Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);

    // Agent routes
    Route::get('/packs', [PackController::class, 'index']);
    Route::post('/packs', [PackController::class, 'store']);
    Route::put('/packs/{id}', [PackController::class, 'update']);
    Route::delete('/packs/{id}', [PackController::class, 'destroy']);

    // ===== ROUTES POUR LES RÉSERVATIONS =====
    Route::get('/reservations', [ReservationController::class, 'index']);
    Route::post('/reservations', [ReservationController::class, 'store']);
    Route::get('/reservations/{id}', [ReservationController::class, 'show']);
    Route::put('/reservations/{id}', [ReservationController::class, 'update']);
    Route::delete('/reservations/{id}', [ReservationController::class, 'destroy']);
    Route::get('/reservations-statistiques', [ReservationController::class, 'statistiques']);
    Route::post('/check-disponibilite', [ReservationController::class, 'checkDisponibilite']);
    // ✅ ROUTE AJOUTÉE POUR RÉCUPÉRER LES RÉSERVATIONS D'UN UTILISATEUR
    Route::get('/reservations/user/{userId}', [ReservationController::class, 'getUserReservations']);

    Route::get('/reservations-statistiques', [ReservationController::class, 'statistiques']);
    Route::post('/check-disponibilite', [ReservationController::class, 'checkDisponibilite']);

    // ===== NOUVELLES ROUTES POUR LES DOCUMENTS =====
    // Upload de documents
    Route::post('/documents/upload', [DocumentController::class, 'upload']);

    // Récupérer les documents d'une réservation
    Route::get('/documents/reservation/{reservationId}', [DocumentController::class, 'getByReservation']);

    // Télécharger un document
    Route::get('/documents/{id}/fichier', [DocumentController::class, 'download']);

    // Valider/rejeter un document (pour l'agent)
    Route::patch('/documents/{id}/valider', [DocumentController::class, 'valider']);

    // Supprimer un document
    Route::delete('/documents/{id}', [DocumentController::class, 'destroy']);

    // ===== ROUTES POUR LES DEMANDES PERSONNALISÉES =====
    Route::post('/demandes-personnalisees', [DemandePersonnaliseeController::class, 'store']);
    // Routes optionnelles pour les agents (si besoin)
    Route::get('/demandes-personnalisees', [DemandePersonnaliseeController::class, 'index']); // Lister toutes les demandes (agent/admin)
    Route::get('/demandes-personnalisees/{id}', [DemandePersonnaliseeController::class, 'show']); // Voir une demande
    Route::put('/demandes-personnalisees/{id}', [DemandePersonnaliseeController::class, 'update']); // Mettre à jour statut
    Route::delete('/demandes-personnalisees/{id}', [DemandePersonnaliseeController::class, 'destroy']); // Supprimer
});
