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
        Schema::table('draft_jobs', function (Blueprint $table) {
            $table->json('files')->nullable();
        });
        Schema::table('finalized_jobs', function (Blueprint $table) {
            $table->json('files')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('draft_jobs', function (Blueprint $table) {
            $table->dropColumn('files');
        });
        Schema::table('finalized_jobs', function (Blueprint $table) {
            $table->dropColumn('files');
        });
    }
};
