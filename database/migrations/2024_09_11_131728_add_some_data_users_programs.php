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
        Schema::table('users_programs', function (Blueprint $table) {
            $table->foreignId('program_id')->constrained('programs')->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users_programs', function (Blueprint $table) {
            $table->dropForeign(['program_id']);
            $table->dropColumn('program_id');
        });
    }
};
