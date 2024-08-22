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
        Schema::table('users_aggreements', function (Blueprint $table) {
            $table->foreignId('aggreement_id')->constrained('aggreements');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users_aggreements', function (Blueprint $table) {
            $table->dropForeign(['aggreement_id']);
            $table->dropColumn('aggreement_id');
        });
    }
};
