<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('packs', function (Blueprint $table) {
            $table->id();
            $table->string('titre');
            $table->text('description');
            $table->decimal('prix', 10, 2);
            $table->integer('duree');
            $table->string('hotel');
            $table->string('transport');
            $table->text('services');
            $table->boolean('disponible')->default(true);
            $table->integer('reservations')->default(0);
            $table->integer('reservation_trend')->default(0);
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // Lien avec l'agent
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('packs');
    }
};
