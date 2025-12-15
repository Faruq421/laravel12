<?php

namespace App\Http\Controllers\Features;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class RajaOngkirController extends Controller
{
    private $apiKey;
    private $baseUrl = 'https://rajaongkir.komerce.id/api/v1';
    private $originCity;

    public function __construct()
    {
        $this->apiKey = env('RAJAONGKIR_API_KEY');
        $this->originCity = env('RAJAONGKIR_ORIGIN_CITY', 501);
    }

    /**
     * Get list of all provinces.
     */
    public function getProvinces()
    {
        // Check if API key is configured
        if (empty($this->apiKey) || $this->apiKey === 'your_api_key_here') {
            return response()->json([
                'success' => false,
                'message' => 'API Key RajaOngkir belum dikonfigurasi di .env',
                'data' => [],
            ], 400);
        }

        // Try cache first
        $provinces = Cache::get('rajaongkir_provinces');
        if ($provinces) {
            return response()->json([
                'success' => true,
                'data' => $provinces,
            ]);
        }

        try {
            $response = Http::withHeaders([
                'key' => $this->apiKey,
            ])->get("{$this->baseUrl}/destination/province");

            $json = $response->json();

            if ($response->successful() && isset($json['data'])) {
                $provinces = $json['data'];
                Cache::put('rajaongkir_provinces', $provinces, 60 * 60 * 24);

                return response()->json([
                    'success' => true,
                    'data' => $provinces,
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => $json['message'] ?? $json['meta']['message'] ?? 'Gagal mengambil data provinsi',
                'data' => [],
            ], 400);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
                'data' => [],
            ], 500);
        }
    }

    /**
     * Get list of cities by province ID.
     */
    public function getCities($provinceId)
    {
        if (empty($this->apiKey) || $this->apiKey === 'your_api_key_here') {
            return response()->json([
                'success' => false,
                'message' => 'API Key RajaOngkir belum dikonfigurasi di .env',
                'data' => [],
            ], 400);
        }

        $cacheKey = "rajaongkir_cities_{$provinceId}";
        $cities = Cache::get($cacheKey);
        
        if ($cities) {
            return response()->json([
                'success' => true,
                'data' => $cities,
            ]);
        }

        try {
            $response = Http::withHeaders([
                'key' => $this->apiKey,
            ])->get("{$this->baseUrl}/destination/city/{$provinceId}");

            $json = $response->json();

            if ($response->successful() && isset($json['data'])) {
                $cities = $json['data'];
                Cache::put($cacheKey, $cities, 60 * 60 * 24);

                return response()->json([
                    'success' => true,
                    'data' => $cities,
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => $json['message'] ?? $json['meta']['message'] ?? 'Gagal mengambil data kota',
                'data' => [],
            ], 400);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
                'data' => [],
            ], 500);
        }
    }

    /**
     * Get all shipping options at once (combines multiple couriers).
     * Uses x-www-form-urlencoded format as required by Komerce API.
     */
    public function getAllShippingOptions(Request $request)
    {
        $validated = $request->validate([
            'destination' => 'required|integer',
            'weight' => 'required|integer|min:1',
        ]);

        // Komerce API uses colon-separated courier list
        $couriers = 'jne:tiki:pos';

        try {
            // Use asForm() to send as x-www-form-urlencoded
            $response = Http::withHeaders([
                'key' => $this->apiKey,
            ])->asForm()->post("{$this->baseUrl}/calculate/domestic-cost", [
                'origin' => $this->originCity,
                'destination' => $validated['destination'],
                'weight' => $validated['weight'],
                'courier' => $couriers,
            ]);

            $json = $response->json();

            if ($response->successful() && isset($json['data']) && is_array($json['data'])) {
                $allCosts = [];
                
                // Komerce API returns flat array of services, not nested
                foreach ($json['data'] as $service) {
                    $courierCode = $service['code'] ?? 'unknown';
                    $courierName = $service['name'] ?? $courierCode;
                    $serviceName = $service['service'] ?? '';
                    
                    // Filter out expensive trucking/motor services for regular packages
                    $cost = (int)($service['cost'] ?? 0);
                    if ($cost > 100000) {
                        continue; // Skip very expensive services like trucking
                    }

                    $allCosts[] = [
                        'id' => strtolower($courierCode) . '_' . strtolower(str_replace([' ', '<', '>'], '_', $serviceName)),
                        'courier' => strtoupper($courierCode),
                        'courier_name' => $courierName,
                        'service' => $serviceName,
                        'description' => $service['description'] ?? '',
                        'cost' => $cost,
                        'etd' => str_replace(' day', '', $service['etd'] ?? '-'),
                    ];
                }

                // Sort by cost ascending
                usort($allCosts, fn($a, $b) => $a['cost'] <=> $b['cost']);

                return response()->json([
                    'success' => true,
                    'data' => $allCosts,
                ]);
            }

            // Return error with debug info
            return response()->json([
                'success' => false,
                'message' => $json['meta']['message'] ?? $json['message'] ?? 'Tidak ada layanan pengiriman tersedia',
                'data' => [],
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
                'data' => [],
            ], 500);
        }
    }

    /**
     * Calculate shipping cost for a single courier.
     */
    public function calculateCost(Request $request)
    {
        $validated = $request->validate([
            'destination' => 'required|integer',
            'weight' => 'required|integer|min:1',
            'courier' => 'required|string',
        ]);

        try {
            $response = Http::withHeaders([
                'key' => $this->apiKey,
            ])->asForm()->post("{$this->baseUrl}/calculate/domestic-cost", [
                'origin' => $this->originCity,
                'destination' => $validated['destination'],
                'weight' => $validated['weight'],
                'courier' => $validated['courier'],
            ]);

            $json = $response->json();

            if ($response->successful() && isset($json['data'])) {
                $costs = [];
                foreach ($json['data'] as $courier) {
                    foreach ($courier['costs'] ?? [] as $service) {
                        foreach ($service['cost'] ?? [] as $cost) {
                            $costs[] = [
                                'courier' => strtoupper($courier['code'] ?? $validated['courier']),
                                'courier_name' => $courier['name'] ?? $validated['courier'],
                                'service' => $service['service'] ?? '',
                                'description' => $service['description'] ?? '',
                                'cost' => (int)($cost['value'] ?? 0),
                                'etd' => $cost['etd'] ?? '-',
                            ];
                        }
                    }
                }

                return response()->json([
                    'success' => true,
                    'data' => $costs,
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => $json['meta']['message'] ?? 'Gagal mengambil data ongkir',
            ], 422);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }
}
