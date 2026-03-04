<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Supprimer uniquement les anciennes colonnes
            if (Schema::hasColumn('users', 'ville')) {
                $table->dropColumn('ville');
            }

            if (Schema::hasColumn('users', 'region')) {
                $table->dropColumn('region');
            }

            // ⚠️ Ne rien ajouter ici : delegation et gouvernorat existent déjà
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Restaurer les anciennes colonnes
            $table->string('ville')->nullable();
            $table->string('region')->nullable();

            // ⚠️ Ne pas toucher à delegation et gouvernorat
        });
    }
};
