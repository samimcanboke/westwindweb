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
        Schema::create('finalized_jobs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('client_id');
            $table->foreign('user_id')->references('id')->on('users');
            $table->foreign('client_id')->references('id')->on('clients');
            $table->string('initial_date')->nullable();
            $table->string('zug_nummer')->nullable();
            $table->string('tour_name')->nullable();
            $table->string('locomotive_number')->nullable();
            $table->boolean('cancel')->nullable();
            $table->boolean('accomodation')->nullable();
            $table->boolean('bereitschaft')->nullable();
            $table->string('comment')->nullable();
            $table->string('feeding_fee')->nullable();
            $table->string('guest_start_place')->nullable();
            $table->string('guest_start_time')->nullable();
            $table->string('guest_start_end_place')->nullable();
            $table->string('guest_start_end_time')->nullable();
            $table->string('work_start_place')->nullable();
            $table->string('work_start_time')->nullable();
            $table->string('train_start_place')->nullable();
            $table->string('train_start_time')->nullable();
            $table->string('train_end_place')->nullable();
            $table->string('train_end_time')->nullable();
            $table->string('breaks')->nullable();
            $table->string('work_end_place')->nullable();
            $table->string('work_end_time')->nullable();
            $table->string('guest_end_place')->nullable();
            $table->string('guest_end_time')->nullable();
            $table->string('guest_end_end_place')->nullable();
            $table->string('guest_end_end_time')->nullable();
            $table->boolean('confirmation')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('finalized_jobs');
    }
};
