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
            $table->boolean('early_exit')->default(false);
            $table->boolean('late_enter')->default(false);
        });
        Schema::table('finalized_jobs', function (Blueprint $table) {
            $table->boolean('early_exit')->default(false);
            $table->boolean('late_enter')->default(false);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('draft_jobs', function (Blueprint $table) {
            $table->dropColumn('early_exit');
            $table->dropColumn('late_enter');
        });
        Schema::table('finalized_jobs', function (Blueprint $table) {
            $table->dropColumn('early_exit');
            $table->dropColumn('late_enter');
        });
    }
};
