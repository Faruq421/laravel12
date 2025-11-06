Perintah untuk Gemini CLI: Perbaikan Error Paginasi Backend

Tujuan: Memperbaiki error TypeError: (reading 'total') di ShopPage.tsx dengan memastikan backend (Controller) mengirimkan Objek Paginasi Laravel yang benar, bukan Array.

Tugas 1: Perbaiki Kueri di ProductController

Buka File: app/Features/Product/ProductController.php

Cari Method: public function shopIndex(Request $request)

Temukan Baris Kueri: Cari baris di mana kueri dieksekusi, kemungkinan besar di dekat akhir method.

Pastikan baris tersebut adalah sebagai berikut:

// ... (setelah semua 'if' dan 'when' untuk filter dan sort)

// INI MUNGKIN SALAH (misalnya: ->get() atau ->paginate(6) tanpa withQueryString)
// $products = $productsQuery->get(); // <--- INI SALAH!

// PASTIKAN ANDA MENGGANTINYA DENGAN YANG BENAR:
// Gunakan paginate() untuk membuat Objek Paginasi
// Gunakan withQueryString() agar filter tetap ada saat berpindah halaman
$products = $productsQuery->paginate(6)->withQueryString();

// Pastikan render-nya juga benar
return Inertia::render('Features/Product/ShopPage', [
    'products' => $products, // $products HARUS berupa Objek Paginasi
    'filters' => $request->only(['sort', 'category', 'min_price', 'max_price']),
]);


Poin Kritis: Pastikan ->get() TIDAK digunakan, dan ->paginate(6)->withQueryString() DIGUNAKAN.
