<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('finalized_jobs', function (Blueprint $table) {
            $table->unsignedBigInteger('job_plan_id')->constrained('job_plans')->nullable();
            $table->uuid(column: 'tour_id')->nullable();
        });
        Schema::table('draft_jobs', function (Blueprint $table) {
            $table->unsignedBigInteger('job_plan_id')->constrained('job_plans')->nullable();
            $table->uuid('tour_id')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('draft_jobs', function (Blueprint $table) {
            $table->dropColumn('job_plan_id');
            $table->dropColumn('tour_id');
        });
        Schema::table('finalized_jobs', function (Blueprint $table) {
            $table->dropColumn('job_plan_id');
            $table->dropColumn('tour_id');
        });
    }
};
