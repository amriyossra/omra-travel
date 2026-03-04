<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Vérifier si l'utilisateur a le rôle requis
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        $user = $request->user();

        // Vérifier si l'utilisateur est authentifié
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Non authentifié. Veuillez vous connecter.'
            ], 401);
        }

        // Vérifier si l'utilisateur a un des rôles requis
        if (!in_array($user->role, $roles)) {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé. Rôle requis: ' . implode(', ', $roles),
                'current_role' => $user->role
            ], 403);
        }

        return $next($request);
    }
}
