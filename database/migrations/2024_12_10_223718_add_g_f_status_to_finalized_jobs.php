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
            $table->tinyInteger('gf_start_status')->default(0)->comment('0: empty, 1: hotel, 2: house');
            $table->tinyInteger('gf_end_status')->default(0)->comment('0: empty, 1: hotel, 2: house');
        });
        Schema::table('draft_jobs', function (Blueprint $table) {
            $table->tinyInteger('gf_start_status')->default(0)->comment('0: empty, 1: hotel, 2: house');
            $table->tinyInteger('gf_end_status')->default(0)->comment('0: empty, 1: hotel, 2: house');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('finalized_jobs', function (Blueprint $table) {
            $table->dropColumn('gf_start_status');
            $table->dropColumn('gf_end_status');
        });
        Schema::table('draft_jobs', function (Blueprint $table) {
            $table->dropColumn('gf_start_status');
            $table->dropColumn('gf_end_status');
        });
    }
};
