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
        Schema::table('orders', function (Blueprint $table) {
            $table->string('snap_token')->nullable()->after('payment_status');
            $table->string('midtrans_order_id')->nullable()->after('snap_token');
            $table->string('transaction_id')->nullable()->after('midtrans_order_id');
            $table->timestamp('payment_time')->nullable()->after('transaction_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['snap_token', 'midtrans_order_id', 'transaction_id', 'payment_time']);
        });
    }
};
