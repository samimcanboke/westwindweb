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
        Schema::table('job_plans', function (Blueprint $table) {
            $table->time('start_pause_time')->nullable();
            $table->time('end_pause_time')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('job_plans', function (Blueprint $table) {
            $table->dropColumn('start_pause_time');
            $table->dropColumn('end_pause_time');
        });
    }
};
