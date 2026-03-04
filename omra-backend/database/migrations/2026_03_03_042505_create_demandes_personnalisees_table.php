<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('demandes_personnalisees', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->integer('nombre_personnes');
            $table->integer('duree');
            $table->date('date_depart');
            $table->string('ville_depart');
            $table->string('hotel_makkah');
            $table->string('hotel_medina');
            $table->string('type_chambre');
            $table->boolean('visa')->default(false);
            $table->boolean('assurance')->default(false);
            $table->boolean('transport_local')->default(false);
            $table->boolean('guide_prive')->default(false);
            $table->boolean('repas_inclus')->default(false);
            $table->boolean('zamzam')->default(false);
            $table->decimal('budget', 10, 2)->nullable();
            $table->string('mode_paiement');
            $table->text('demandes_speciales')->nullable();
            $table->string('statut')->default('en_attente'); // en_attente, traitee, convertie
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('demandes_personnalisees');
    }
};
