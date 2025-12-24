<?php

namespace App\Http\Controllers\Features;

use App\Features\Order\Order;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Midtrans\Config;
use Midtrans\Snap;
use Midtrans\Notification;

class PaymentController extends Controller
{
    public function __construct()
    {
        // Set Midtrans configuration
        Config::$serverKey = config('midtrans.server_key');
        Config::$clientKey = config('midtrans.client_key');
        Config::$isProduction = config('midtrans.is_production');
        Config::$isSanitized = config('midtrans.is_sanitized');
        Config::$is3ds = config('midtrans.is_3ds');
    }

    /**
     * Create a Snap payment token for an order.
     */
    public function createSnapToken(Order $order)
    {
        // Verify the order belongs to the current user
        if ($order->user_id !== auth()->id()) {
            abort(403, 'Unauthorized access to this order.');
        }

        // Check if order is already paid
        if ($order->payment_status === 'paid') {
            return response()->json([
                'error' => 'Order has already been paid.',
            ], 400);
        }

        // Build transaction details
        $transactionDetails = [
            'order_id' => 'ORDER-' . $order->id . '-' . time(),
            'gross_amount' => (int) $order->total_price,
        ];

        // Build customer details
        $shippingAddress = $order->shipping_address;
        $customerDetails = [
            'first_name' => $shippingAddress['name'] ?? auth()->user()->name,
            'email' => auth()->user()->email,
            'phone' => $shippingAddress['phone'] ?? '',
            'billing_address' => [
                'first_name' => $shippingAddress['name'] ?? '',
                'address' => $shippingAddress['address'] ?? '',
                'city' => $shippingAddress['city'] ?? '',
                'postal_code' => $shippingAddress['postal_code'] ?? '',
                'country_code' => 'IDN',
            ],
            'shipping_address' => [
                'first_name' => $shippingAddress['name'] ?? '',
                'address' => $shippingAddress['address'] ?? '',
                'city' => $shippingAddress['city'] ?? '',
                'postal_code' => $shippingAddress['postal_code'] ?? '',
                'country_code' => 'IDN',
            ],
        ];

        // Build item details
        $itemDetails = [];
        foreach ($order->items as $item) {
            $itemDetails[] = [
                'id' => $item->product_id_produk,
                'price' => (int) $item->price,
                'quantity' => $item->quantity,
                'name' => substr($item->product->nama_produk ?? 'Product', 0, 50),
            ];
        }

        // Add shipping cost as an item
        if ($order->shipping_cost > 0) {
            $itemDetails[] = [
                'id' => 'SHIPPING',
                'price' => (int) $order->shipping_cost,
                'quantity' => 1,
                'name' => 'Biaya Pengiriman (' . $order->shipping_method . ')',
            ];
        }

        // Add tax as an item (11%)
        $subtotal = $order->items->sum(fn($item) => $item->price * $item->quantity);
        $tax = (int) round($subtotal * 0.11);
        if ($tax > 0) {
            $itemDetails[] = [
                'id' => 'TAX',
                'price' => $tax,
                'quantity' => 1,
                'name' => 'PPN (11%)',
            ];
        }

        // Build transaction payload
        $transactionPayload = [
            'transaction_details' => $transactionDetails,
            'customer_details' => $customerDetails,
            'item_details' => $itemDetails,
            'callbacks' => [
                'finish' => route('orders.show', $order->id),
            ],
        ];

        try {
            $snapToken = Snap::getSnapToken($transactionPayload);

            // Store the snap token in the order for retry purposes
            $order->update([
                'snap_token' => $snapToken,
                'midtrans_order_id' => $transactionDetails['order_id'],
            ]);

            return response()->json([
                'snap_token' => $snapToken,
                'order_id' => $order->id,
            ]);
        } catch (\Exception $e) {
            Log::error('Midtrans Snap Token Error: ' . $e->getMessage());
            return response()->json([
                'error' => 'Failed to create payment token. Please try again.',
            ], 500);
        }
    }

    /**
     * Handle Midtrans payment notification webhook.
     * This endpoint should be excluded from CSRF verification.
     */
    public function handleNotification(Request $request)
    {
        try {
            $notification = new Notification();

            $transactionStatus = $notification->transaction_status;
            $orderId = $notification->order_id;
            $paymentType = $notification->payment_type;
            $fraudStatus = $notification->fraud_status ?? null;

            Log::info('Midtrans Notification Received', [
                'order_id' => $orderId,
                'transaction_status' => $transactionStatus,
                'payment_type' => $paymentType,
                'fraud_status' => $fraudStatus,
            ]);

            // Extract the actual order ID from Midtrans order_id (format: ORDER-{id}-{timestamp})
            $orderIdParts = explode('-', $orderId);
            $actualOrderId = $orderIdParts[1] ?? null;

            if (!$actualOrderId) {
                Log::error('Invalid order ID format from Midtrans: ' . $orderId);
                return response()->json(['status' => 'error', 'message' => 'Invalid order ID'], 400);
            }

            $order = Order::find($actualOrderId);

            if (!$order) {
                Log::error('Order not found: ' . $actualOrderId);
                return response()->json(['status' => 'error', 'message' => 'Order not found'], 404);
            }

            // Update order based on transaction status
            if ($transactionStatus == 'capture' || $transactionStatus == 'settlement') {
                // Check for fraud status on credit card transactions
                if ($paymentType == 'credit_card') {
                    if ($fraudStatus == 'accept') {
                        $this->updateOrderToPaid($order, $notification);
                    } elseif ($fraudStatus == 'challenge') {
                        // You can hold the order for manual review
                        $order->update([
                            'payment_status' => 'pending',
                            'admin_notes' => 'Payment flagged for fraud review by Midtrans.',
                            'transaction_id' => $notification->transaction_id,
                        ]);
                    }
                } else {
                    $this->updateOrderToPaid($order, $notification);
                }
            } elseif ($transactionStatus == 'pending') {
                $order->update([
                    'payment_status' => 'pending',
                    'transaction_id' => $notification->transaction_id,
                    'payment_method' => $paymentType,
                ]);
            } elseif (in_array($transactionStatus, ['deny', 'cancel', 'expire'])) {
                $order->update([
                    'payment_status' => 'expired',
                    'transaction_id' => $notification->transaction_id,
                ]);
            }

            return response()->json(['status' => 'success']);

        } catch (\Exception $e) {
            Log::error('Midtrans Notification Error: ' . $e->getMessage());
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Update order status to paid.
     */
    private function updateOrderToPaid(Order $order, $notification)
    {
        $order->update([
            'payment_status' => 'paid',
            'order_status' => 'processing',
            'transaction_id' => $notification->transaction_id,
            'payment_method' => $notification->payment_type,
            'payment_time' => now(),
        ]);

        Log::info('Order marked as paid', ['order_id' => $order->id]);
    }

    /**
     * Get Midtrans client key for frontend.
     */
    public function getClientKey()
    {
        return response()->json([
            'client_key' => config('midtrans.client_key'),
            'is_production' => config('midtrans.is_production'),
        ]);
    }
}
