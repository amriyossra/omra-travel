<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Agent;
use App\Models\Admin;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    // =========================
    // REGISTER
    // =========================
    public function register(Request $request)
    {
        if ($request->role === 'pelerin') {
            $user = User::create([
                'civilite' => $request->civilite,
                'prenom' => $request->prenom,
                'nom' => $request->nom,
                'email' => $request->email,
                'telephone' => $request->telephone,
                'adresse' => $request->adresse,
                'ville' => $request->ville,
                'pays' => $request->pays,
                'password' => Hash::make($request->password),
            ]);
        } elseif ($request->role === 'agent') {
            $user = Agent::create([
                'nom_agence' => $request->agence,
                'prenom' => $request->prenom,
                'nom' => $request->nom,
                'email' => $request->email,
                'telephone' => $request->telephone,
                'access_code' => $request->access_code,
                'password' => Hash::make($request->password),
            ]);
        } elseif ($request->role === 'admin') {
            $user = Admin::create([
                'prenom' => $request->prenom,
                'nom' => $request->nom,
                'email' => $request->email,
                'password' => Hash::make($request->password),
            ]);
        } else {
            return response()->json(['error' => 'Rôle invalide'], 400);
        }

        return response()->json([
            'message' => 'Inscription réussie',
            'user' => $user,
            'role' => $request->role
        ]);
    }

    // =========================
    // LOGIN
    // =========================
    public function login(Request $request)
    {
        $role = $request->role;

        $model = match ($role) {
            'pelerin' => User::class,
            'agent' => Agent::class,
            'admin' => Admin::class,
            default => null,
        };

        if (!$model) {
            return response()->json(['message' => 'Rôle invalide'], 400);
        }

        // Chercher l'utilisateur
        $user = $model::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Identifiants incorrects'], 401);
        }

        // Générer token via Sanctum
        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'message' => 'Connexion réussie',
            'token' => $token,
            'user' => $user,
            'role' => $role
        ]);
    }
}
