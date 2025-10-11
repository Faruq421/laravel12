# 💎 Panduan Implementasi: Halaman Riwayat Pesanan & Penyempurnaan Checkout

Dokumen ini berisi rencana langkah demi langkah untuk mengimplementasikan halaman riwayat pesanan yang modern dan ramah pengguna, serta menyempurnakan pengalaman pengguna (UX) pada halaman checkout. Semua implementasi akan menggunakan komponen dari **Shadcn UI** untuk menjaga konsistensi desain.

---

### Bagian 1: Penyempurnaan Halaman Checkout

**Tujuan:** Menciptakan alur checkout yang terfokus untuk mengurangi distraksi dan meningkatkan kepercayaan pengguna, yang pada akhirnya dapat meningkatkan konversi.

**Ketentuan:**
-   Header utama aplikasi akan diganti dengan versi minimalis yang hanya menampilkan logo.
-   Akan ditambahkan tautan yang jelas bagi pengguna untuk kembali ke keranjang belanja jika diperlukan.

#### Langkah 1: Implementasi Header Checkout Minimalis
1.  **Buat Komponen Header Baru:** Buat file komponen React baru di `resources/js/layouts/partials/checkout-header.tsx`.
    -   Isi komponen ini hanya dengan logo aplikasi yang mengarah ke halaman utama. Ini akan menjadi header khusus untuk proses checkout.
2.  **Update Layout Utama:** Modifikasi `resources/js/layouts/authenticated-layout.tsx`.
    -   Gunakan hook `usePage` dari Inertia untuk mendeteksi route saat ini.
    -   Terapkan render kondisional: Jika nama route dimulai dengan `'checkout.'`, tampilkan `<CheckoutHeader />`. Jika tidak, tampilkan `<AppHeader />` yang biasa.

#### Langkah 2: Tambahkan Tautan "Kembali ke Keranjang"
1.  **Modifikasi Halaman Checkout:** Buka `resources/js/pages/Features/Order/Checkout.tsx`.
2.  **Tambahkan Tautan:** Tepat di bawah judul "Secure Checkout", tambahkan komponen `Link` dari Inertia yang mengarah ke `route('cart.index')`.
    -   Gunakan `Button` dengan `variant="outline"` atau `variant="ghost"` dari Shadcn UI.
    -   Sertakan ikon `ArrowLeft` dari `lucide-react` untuk kejelasan visual. Labeli dengan teks seperti "Kembali ke Keranjang".

---

### Bagian 2: Implementasi Halaman Riwayat Pesanan

**Tujuan:** Memberikan pelanggan akses mudah untuk melihat semua transaksi mereka sebelumnya, lengkap dengan detail pesanan. Halaman ini harus intuitif, modern, dan informatif.

**Ketentuan:**
-   Halaman akan menampilkan daftar semua pesanan yang pernah dibuat oleh pengguna yang sedang login.
-   Setiap pesanan akan ditampilkan dalam format yang ringkas dan dapat diperluas untuk melihat detail.
-   Akan ada penanganan untuk kasus di mana pengguna belum memiliki riwayat pesanan.
-   Data akan dipaginasi untuk performa yang optimal.

#### Langkah 1: Backend - Menyiapkan Data
1.  **Buat Route Baru:** Buka `routes/features/order.php` dan daftarkan route `GET` baru untuk `/orders`.
    -   Route ini akan menunjuk ke metode `index` di `OrderController` dan harus dilindungi oleh middleware `auth`. Beri nama route `orders.index`.
2.  **Buat Metode Controller:** Di `app/Features/Order/OrderController.php`, buat metode `index()`.
    -   Logika di dalamnya harus:
        -   Mengambil pengguna yang sedang terautentikasi.
        -   Mengambil semua pesanan (`Order`) milik pengguna tersebut.
        -   Memuat relasi yang dibutuhkan: `orderItems` dan `orderItems.product` (`->with('orderItems.product')`).
        -   Mengurutkan pesanan dari yang terbaru ke yang terlama (`->latest()`).
        -   Menerapkan paginasi (`->paginate(10)`).
        -   Me-render halaman Inertia `Features/Order/Index` dengan data pesanan yang sudah dipaginasi.

#### Langkah 2: Frontend - Membangun Antarmuka Pengguna (UI)
1.  **Buat File Halaman Baru:** Buat file `resources/js/Pages/Features/Order/Index.tsx`.
2.  **Struktur Halaman:**
    -   Gunakan `AuthenticatedLayout` sebagai layout utama.
    -   Gunakan komponen `Head` dari Inertia untuk mengatur judul halaman menjadi "Riwayat Pesanan".
    -   Tambahkan judul halaman yang jelas, misalnya `<h1>Riwayat Pesanan Anda</h1>`.
3.  **Tampilan Daftar Pesanan (Menggunakan Shadcn UI):**
    -   **Kasus Utama (Ada Pesanan):** Gunakan komponen `Accordion` dari Shadcn UI sebagai wadah utama. Setiap `AccordionItem` akan mewakili satu pesanan.
        -   **`AccordionTrigger`:** Akan menampilkan informasi ringkas pesanan:
            -   Nomor Pesanan (misal: `Order #1001`).
            -   Tanggal Pemesanan (format agar mudah dibaca).
            -   Total Harga.
            -   Status Pesanan (gunakan komponen `Badge` dari Shadcn UI untuk status seperti "Diproses", "Dikirim", "Selesai").
        -   **`AccordionContent`:** Akan menampilkan detail item di dalam pesanan tersebut.
            -   Gunakan komponen `Table` dari Shadcn UI di dalamnya.
            -   Kolom tabel: "Produk" (gambar dan nama), "Kuantitas", "Harga Satuan", "Subtotal".
            -   Di bawah tabel, tampilkan juga ringkasan alamat pengiriman yang digunakan untuk pesanan tersebut.
    -   **Kasus Tepi (Tidak Ada Pesanan):** Jika prop `orders.data` kosong, tampilkan pesan yang ramah.
        -   Gunakan komponen `Alert` atau `Card` kosong.
        -   Isi dengan pesan seperti "Anda belum memiliki riwayat pesanan." dan sertakan `Button` yang mengarahkan pengguna ke halaman utama atau halaman produk untuk mulai berbelanja.
4.  **Implementasi Paginasi:**
    -   Data pesanan yang diterima dari backend akan berisi `links` paginasi.
    -   Buat komponen `Pagination` sederhana atau render tautan ini di bagian bawah daftar pesanan menggunakan `Button` dari Shadcn UI untuk setiap tautan (`prev`, `next`, nomor halaman).

#### Langkah 3: Menambahkan Tautan Navigasi
1.  **Update Menu Pengguna:** Cari file yang mengatur item menu navigasi pengguna (kemungkinan di `resources/js/lib/navigation.ts` atau di dalam komponen header).
2.  **Tambahkan Tautan Baru:** Tambahkan item menu baru berlabel "Riwayat Pesanan" yang mengarah ke `route('orders.index')`. Tempatkan di dekat tautan "Profil" atau "Pengaturan".

---
Setelah file ini diperbarui, kita akan mulai eksekusi dari **Bagian 1, Langkah 1**.