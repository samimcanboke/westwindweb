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
        Schema::table('g_p_s_locations', function (Blueprint $table) {
            $table->uuid('tour_id');
            $table->tinyInteger('type')->enum(0,1,2)->comment('0: gf_start, 1: work, 2: gf_end');
            $table->string('start_location')->nullable()->change();
            $table->string('end_location')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('g_p_s_locations', function (Blueprint $table) {
            $table->dropColumn('tour_id');
            $table->dropColumn('type');
            $table->string('start_location')->required()->change();
            $table->string('end_location')->required()->change();
        });
    }
};
