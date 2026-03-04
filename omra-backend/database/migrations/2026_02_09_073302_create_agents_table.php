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
        // database/migrations/create_agents_table.php
Schema::create('agents', function (Blueprint $table) {
    $table->id();
    $table->string('nom_agence');
    $table->string('prenom');
    $table->string('nom');
    $table->string('email')->unique();
    $table->string('telephone');
    $table->string('access_code');
    $table->string('password');
    $table->timestamps();
});

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
