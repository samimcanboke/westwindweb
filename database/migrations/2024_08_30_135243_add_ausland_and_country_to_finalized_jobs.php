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
        Schema::table('finalized_jobs', function (Blueprint $table) {
            $table->boolean('ausland')->nullable()->default(false);
            $table->string('country')->nullable()->default('de');
        });
        Schema::table('draft_jobs', function (Blueprint $table) {
            $table->boolean('ausland')->nullable()->default(false);
            $table->string('country')->nullable()->default('de');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('finalized_jobs', function (Blueprint $table) {
            $table->dropColumn('ausland');
            $table->dropColumn('country');
        });
        Schema::table('draft_jobs', function (Blueprint $table) {
            $table->dropColumn('ausland');
            $table->dropColumn('country');
        });
    }
};
