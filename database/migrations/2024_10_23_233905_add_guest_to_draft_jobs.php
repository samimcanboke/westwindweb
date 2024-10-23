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
            $table->boolean('guest')->default(false);
        });
        Schema::table('finalized_jobs', function (Blueprint $table) {
            $table->boolean('guest')->default(false);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('draft_jobs', function (Blueprint $table) {
            $table->dropColumn('guest');
        });
        Schema::table('finalized_jobs', function (Blueprint $table) {
            $table->dropColumn('guest');
        });
    }
};
