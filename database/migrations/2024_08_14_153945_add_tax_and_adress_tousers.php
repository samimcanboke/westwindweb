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
        Schema::table('users', function (Blueprint $table) {
            $table->string('tax_id')->nullable();
            $table->string('street')->nullable();
            $table->string('city')->nullable();
            $table->string('apartment')->nullable();
            $table->string('zip')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('tax_id');
            $table->dropColumn('street');
            $table->dropColumn('city');
            $table->dropColumn('apartment');
            $table->dropColumn('zip');
        });
    }
};
