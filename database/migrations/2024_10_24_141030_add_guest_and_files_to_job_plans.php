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
            $table->string('guest')->nullable();
            $table->json('files')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('job_plans', function (Blueprint $table) {
            $table->dropColumn('guest');
            $table->dropColumn('files');
        });
    }
};
