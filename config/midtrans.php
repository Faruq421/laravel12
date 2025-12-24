<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Midtrans Server Key
    |--------------------------------------------------------------------------
    |
    | Your Midtrans Server Key. This is used on the backend to generate
    | Snap tokens and verify payment notifications.
    |
    */
    'server_key' => env('MIDTRANS_SERVER_KEY', ''),

    /*
    |--------------------------------------------------------------------------
    | Midtrans Client Key
    |--------------------------------------------------------------------------
    |
    | Your Midtrans Client Key. This is used on the frontend to initialize
    | the Snap.js payment popup.
    |
    */
    'client_key' => env('MIDTRANS_CLIENT_KEY', ''),

    /*
    |--------------------------------------------------------------------------
    | Production Mode
    |--------------------------------------------------------------------------
    |
    | Set to true when you want to use Midtrans production environment.
    | When false, Midtrans Sandbox will be used for testing.
    |
    */
    'is_production' => env('MIDTRANS_IS_PRODUCTION', false),

    /*
    |--------------------------------------------------------------------------
    | Sanitize
    |--------------------------------------------------------------------------
    |
    | Enable or disable Midtrans input sanitization.
    |
    */
    'is_sanitized' => env('MIDTRANS_IS_SANITIZED', true),

    /*
    |--------------------------------------------------------------------------
    | 3DS
    |--------------------------------------------------------------------------
    |
    | Enable or disable 3D Secure for credit card payments.
    |
    */
    'is_3ds' => env('MIDTRANS_IS_3DS', true),
];
