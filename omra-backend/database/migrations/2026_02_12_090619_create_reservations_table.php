<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('reservations', function (Blueprint $table) {
            $table->id();

            // Relation avec l'utilisateur (pèlerin)
            $table->foreignId('user_id')
                  ->constrained()
                  ->onDelete('cascade')
                  ->comment('ID du pèlerin qui fait la réservation');

            // Relation avec le pack
            $table->foreignId('pack_id')
                  ->constrained()
                  ->onDelete('cascade')
                  ->comment('ID du pack Omra réservé');

            // Informations personnelles du pèlerin
            $table->string('nom')->comment('Nom du pèlerin');
            $table->string('prenom')->comment('Prénom du pèlerin');
            $table->string('email')->comment('Email du pèlerin');
            $table->string('telephone')->comment('Numéro de téléphone');
            $table->date('date_naissance')->nullable()->comment('Date de naissance');
            $table->string('lieu_naissance')->nullable()->comment('Lieu de naissance');
            $table->string('nationalite')->default('Tunisienne')->comment('Nationalité');
            $table->string('passeport_numero')->nullable()->comment('Numéro de passeport');
            $table->date('passeport_expiration')->nullable()->comment('Date d\'expiration du passeport');

            // Adresse
            $table->string('adresse')->nullable()->comment('Adresse complète');
            $table->string('code_postal')->nullable()->comment('Code postal');
            $table->string('ville')->nullable()->comment('Ville');
            $table->string('pays')->default('Tunisie')->comment('Pays');

            // Détails de la réservation
            $table->integer('nombre_personnes')->default(1)->comment('Nombre de personnes');
            $table->integer('nombre_chambres')->default(1)->comment('Nombre de chambres');
            $table->text('accompagnants')->nullable()->comment('Liste des accompagnants (JSON)');

            // Options et services supplémentaires
            $table->boolean('assurance')->default(false)->comment('Assurance voyage');
            $table->boolean('visa')->default(false)->comment('Service de visa');
            $table->boolean('transport_local')->default(false)->comment('Transport sur place');
            $table->boolean('guide_prive')->default(false)->comment('Guide privé');
            $table->text('demandes_speciales')->nullable()->comment('Demandes particulières');

            // Préférences
            $table->enum('type_chambre', ['simple', 'double', 'triple', 'quadruple', 'suite'])->default('double');
            $table->enum('regime_alimentaire', ['normal', 'vegetarien', 'halal', 'sans_gluten', 'autre'])->default('halal');
            $table->string('regime_alimentaire_autre')->nullable();

            // Informations médicales (optionnel)
            $table->boolean('probleme_sante')->default(false);
            $table->text('informations_medicales')->nullable();

            // Paiement
            $table->decimal('prix_total', 10, 2)->comment('Prix total de la réservation');
            $table->decimal('acompte', 10, 2)->nullable()->comment('Acompte versé');
            $table->enum('statut_paiement', ['en_attente', 'partiel', 'paye', 'rembourse'])->default('en_attente');
            $table->string('mode_paiement')->nullable()->comment('Carte, virement, espèces');
            $table->string('reference_paiement')->nullable()->unique()->comment('Référence de transaction');

            // Statut de la réservation
            $table->enum('statut', [
                'en_attente',      // En attente de confirmation
                'confirmee',       // Confirmée par l'agent
                'en_cours',        // Voyage en cours
                'terminee',        // Voyage terminé
                'annulee',         // Annulée
                'remboursee'       // Remboursée
            ])->default('en_attente')->comment('Statut de la réservation');

            // Dates importantes
            $table->date('date_depart')->nullable()->comment('Date de départ');
            $table->date('date_retour')->nullable()->comment('Date de retour');
            $table->timestamp('date_confirmation')->nullable()->comment('Date de confirmation par l\'agent');
            $table->timestamp('date_annulation')->nullable()->comment('Date d\'annulation');

            // Notes
            $table->text('notes_agent')->nullable()->comment('Notes de l\'agent');
            $table->text('notes_pelerin')->nullable()->comment('Notes du pèlerin');

            // Métadonnées
            $table->string('code_reservation', 20)->unique()->nullable()->comment('Code unique de réservation');
            $table->json('metadata')->nullable()->comment('Données supplémentaires');

            $table->timestamps();
            $table->softDeletes(); // Pour archivage
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reservations');
    }
};
