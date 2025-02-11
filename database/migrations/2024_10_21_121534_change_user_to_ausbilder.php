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
            $table->renameColumn('user', 'ausbilder');
        });

        Schema::table('draft_jobs', function (Blueprint $table) {
            $table->renameColumn('user', 'ausbilder');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('finalized_jobs', function (Blueprint $table) {
            $table->renameColumn('ausbilder', 'user');
        });

        Schema::table('draft_jobs', function (Blueprint $table) {
            $table->renameColumn('ausbilder', 'user');
        });
    }
};
