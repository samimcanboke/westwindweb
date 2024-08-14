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
        Schema::table('users', function (Blueprint $table) {
            $table->string('private_phone')->nullable();
            $table->string('address')->nullable();
            $table->string('nationality')->nullable();
            $table->string('bank_name')->nullable();
            $table->string('bank_account_number')->nullable();
            $table->string('bank_iban')->nullable();
            $table->string('bank_bic')->nullable();
            $table->string('bank_account_holder')->nullable();
            $table->string('insurance_number')->nullable();
            $table->string('social_security_number')->nullable();
            $table->string('social_security_name')->nullable();
            $table->integer('kinder')->nullable();
            $table->boolean('is_retired')->nullable();
            $table->integer('tax_class')->nullable();
            $table->string('identity_number')->nullable();
            $table->string('urgency_contact_name')->nullable();
            $table->string('urgency_contact_phone')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('private_phone');
            $table->dropColumn('address');
            $table->dropColumn('nationality');
            $table->dropColumn('bank_name');
            $table->dropColumn('bank_account_number');
            $table->dropColumn('bank_iban');
            $table->dropColumn('bank_bic');
            $table->dropColumn('bank_account_holder');
            $table->dropColumn('insurance_number');
            $table->dropColumn('social_security_number');
            $table->dropColumn('social_security_name');
            $table->dropColumn('kinder');
            $table->dropColumn('is_retired');
            $table->dropColumn('tax_class');
            $table->dropColumn('identity_number');
            $table->dropColumn('urgency_contact_name');
            $table->dropColumn('urgency_contact_phone');
        });
    }
};
