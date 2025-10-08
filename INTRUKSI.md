# Brief Desain & Teknis v4: Alur Keranjang Belanja & Manajemen Pesanan

## 1. Visi & Tujuan Utama

Mengimplementasikan alur kerja e-commerce lengkap dari awal hingga akhir. Ini mencakup pengalaman pelanggan (menambah produk ke keranjang, checkout) dan panel admin (manajemen pesanan). Tujuannya adalah menciptakan sistem yang fungsional, intuitif, dan terintegrasi penuh, dengan antarmuka yang modern sesuai referensi desain yang diberikan dan standar e-commerce Indonesia.

---

## BAGIAN A: FONDASI & BACKEND

### Langkah 1: Migrasi & Struktur Database
Kita akan membuat tiga tabel baru yang menjadi tulang punggung sistem pesanan.

**a. Tabel `orders`:** Menyimpan informasi utama setiap pesanan.
-   `php artisan make:migration create_orders_table`
-   **Kolom:**
    -   `id` (Primary Key)
    -   `user_id` (Foreign Key ke tabel `users`)
    -   `customer_id` (Foreign Key ke tabel `customers`, jika ada)
    -   `order_status` (string, default: 'pending'. Contoh: 'pending', 'processing', 'shipped', 'completed', 'cancelled')
    -   `total_price` (decimal)
    -   `shipping_address` (text/json, untuk menyimpan snapshot alamat)
    -   `shipping_cost` (decimal, default: 0)
    -   `shipping_method` (string, misal: 'JNE REG', 'GoSend Instant')
    -   `payment_method` (string, misal: 'BCA Virtual Account')
    -   `payment_status` (string, default: 'unpaid'. Contoh: 'unpaid', 'paid', 'expired')
    -   `estimated_completion_date` (date, dapat diisi oleh admin)
    -   `admin_notes` (text, catatan dari admin untuk pesanan)
    -   `timestamps`

**b. Tabel `order_items`:** Menyimpan setiap produk dalam sebuah pesanan.
-   `php artisan make:migration create_order_items_table`
-   **Kolom:**
    -   `id`
    -   `order_id` (Foreign Key ke `orders`)
    -   `product_id_produk` (Foreign Key ke `products`)
    -   `quantity` (integer)
    -   `price` (decimal, harga produk saat checkout)
    -   `options` (json, untuk menyimpan snapshot varian, desain, dan catatan. **Sangat Penting!**)
    -   `timestamps`

### Langkah 2: Scaffolding Fitur & Model
-   Gunakan perintah kustom kita untuk membuat kerangka fitur `Order`.
    -   `php artisan make:feature Order`
-   Buat model `OrderItem` secara manual.
-   Definisikan relasi pada model:
    -   `Order` `hasMany` `OrderItem`.
    -   `Order` `belongsTo` `User`.
    -   `OrderItem` `belongsTo` `Order`.
    -   `OrderItem` `belongsTo` `Product`.
    -   `User` `hasMany` `Order`.

### Langkah 3: Logika Keranjang Belanja (Berbasis Sesi)
-   Buat `CartController` baru (`php artisan make:controller Features/Cart/CartController`).
-   **Rute (di `web.php`):**
    -   `POST /cart` -> `CartController@add`
    -   `PATCH /cart/{productId}` -> `CartController@update`
    -   `DELETE /cart/{productId}` -> `CartController@remove`
-   **Logika Controller:**
    -   `add`: Menambahkan produk beserta varian, desain, dan kuantitas ke dalam `session('cart')`.
    -   `update`: Mengubah kuantitas item di dalam sesi.
    -   `remove`: Menghapus item dari sesi.

### Langkah 4: Berbagi Data Keranjang Global
-   Modifikasi middleware `HandleInertiaRequests` untuk membagikan data `session('cart')` ke semua halaman. Ini memungkinkan *header* untuk selalu menampilkan jumlah item keranjang yang terbaru.

### Langkah 5: Logika Checkout & Manajemen Pesanan (di `OrderController`)
-   **Method `store` (untuk Pelanggan):**
    1.  Validasi data (alamat, metode pengiriman).
    2.  Ambil data keranjang dari sesi.
    3.  Buat entri baru di tabel `orders` dan `order_items`.
    4.  Kosongkan sesi keranjang.
    5.  Redirect ke halaman "Terima Kasih" atau detail pesanan.
-   **Method `index` & `show` (untuk Admin):**
    1.  Lindungi dengan middleware `role:admin`.
    2.  `index`: Tampilkan semua pesanan dengan paginasi dan filter.
    3.  `show`: Tampilkan detail satu pesanan, termasuk item dan informasi pelanggan.
-   **Method `update` (untuk Admin):**
    1.  Validasi input dari admin.
    2.  Perbarui `order_status`, `estimated_completion_date`, dan `admin_notes`.

---

## BAGIAN B: FRONTEND (PENGALAMAN PELANGGAN)

### Langkah 6: Komponen Keranjang Mini (`CartSheet.tsx`)
-   Buat komponen baru `resources/js/components/CartSheet.tsx`.
-   Gunakan komponen `<Sheet>` dari `shadcn/ui`.
-   Tampilkan daftar produk dari *props* keranjang global.
-   Untuk setiap item, tampilkan gambar mini, nama, harga, dan kuantitas.
-   Sediakan tombol +/- untuk mengubah kuantitas (memanggil rute `PATCH /cart/{id}`).
-   Sediakan tombol hapus (memanggil rute `DELETE /cart/{id}`).
-   Tampilkan subtotal.
-   Sediakan tombol "Lihat Keranjang" dan "Checkout".

### Langkah 7: Integrasi Header
-   Modifikasi komponen `Header.tsx`.
-   Tambahkan ikon keranjang belanja dengan *badge* yang menunjukkan jumlah item.
-   Jumlah item diambil dari *props* keranjang global.
-   Mengklik ikon akan membuka `CartSheet`.

### Langkah 8: Halaman Checkout (`Features/Checkout/Index.tsx`)
-   Buat halaman Inertia baru.
-   Gunakan layout grid 2 kolom.
-   **Kolom Kiri (Formulir):**
    -   Formulir Alamat Pengiriman:
        -   Gunakan input standar Indonesia: Nama Penerima, No. Telepon, Alamat Lengkap, Provinsi, Kota/Kabupaten, Kecamatan, Kode Pos.
        -   Gunakan `<Select>` dari `shadcn/ui` untuk Provinsi dan Kota (nantinya diisi oleh API RajaOngkir).
    -   Pilihan Metode Pengiriman: Tampilkan pilihan kurir setelah alamat diisi.
    -   Pilihan Metode Pembayaran.
-   **Kolom Kanan (Ringkasan Pesanan):**
    -   Gunakan `<Card>` untuk membungkus ringkasan.
    -   Tampilkan kembali semua item di keranjang.
    -   Tampilkan rincian biaya: Subtotal, Biaya Pengiriman, Total.
    -   Tombol "Bayar Sekarang" yang akan memicu `OrderController@store`.

---

## BAGIAN C: FRONTEND (PANEL ADMIN)

### Langkah 9: Halaman Manajemen Pesanan (`Features/Order/Index.tsx`)
-   Buat halaman Inertia baru untuk admin.
-   Gunakan komponen `DataTable` yang sudah ada atau buat yang baru untuk menampilkan daftar pesanan.
-   **Kolom Tabel:** ID Pesanan, Nama Pelanggan, Tanggal, Total Harga, Status Pesanan.
-   Sediakan fitur pencarian dan filter berdasarkan status.
-   Setiap baris dapat di-klik untuk melihat detail pesanan.

### Langkah 10: Halaman Detail Pesanan (`Features/Order/Show.tsx`)
-   Buat halaman Inertia baru untuk admin.
-   Tampilkan semua informasi pesanan dalam beberapa `<Card>`:
    -   **Card 1: Detail Pesanan:** Tampilkan status, tanggal, total.
    -   **Card 2: Detail Pelanggan:** Tampilkan nama, email, dan alamat pengiriman.
    -   **Card 3: Item Pesanan:** Tampilkan daftar produk yang dipesan, lengkap dengan varian dan desain yang dipilih.
    -   **Card 4: Aksi Admin:**
        -   Gunakan `<Select>` untuk mengubah `order_status`.
        -   Gunakan `<DatePicker>` untuk mengatur `estimated_completion_date`.
        -   Gunakan `<Textarea>` untuk `admin_notes`.
        -   Tombol "Simpan Perubahan" untuk memicu `OrderController@update`.

---
## RENCANA EKSEKUSI: FITUR KERANJANG BELANJA (8 Oktober 2025)

Berikut adalah langkah-langkah teknis yang akan dieksekusi untuk mengaktifkan fungsionalitas keranjang belanja.

### Tahap 1: Backend (Logika & Data)

1.  **Buat `CartController`:**
    -   **Aksi:** Buat file controller baru di `app/Http/Controllers/Features/CartController.php`.
    -   **Tujuan:** Menjadi pusat logika untuk semua operasi terkait keranjang (tambah, perbarui, hapus).

2.  **Daftarkan Rute Keranjang:**
    -   **Aksi:** Tambahkan rute `POST` untuk `/cart` di dalam file `routes/web.php`.
    -   **Tujuan:** Membuat endpoint yang bisa diakses oleh frontend untuk mengirim data produk yang akan ditambahkan ke keranjang.

3.  **Implementasikan Logika Penambahan Item:**
    -   **Aksi:** Tulis method `store` di dalam `CartController`.
    -   **Tujuan:** Logika ini akan:
        -   Memvalidasi data yang masuk (ID produk, kuantitas, dll.).
        -   Mengambil data keranjang yang sudah ada dari sesi. Jika belum ada, buat array kosong.
        -   Menambahkan produk baru ke dalam array keranjang.
        -   Menyimpan kembali array keranjang yang sudah diperbarui ke dalam sesi.
        -   Mengembalikan respons redirect kembali ke halaman produk.

4.  **Bagikan Data Keranjang ke Frontend (Middleware):**
    -   **Aksi:** Modifikasi method `share` di dalam middleware `app/Http/Middleware/HandleInertiaRequests.php`.
    -   **Tujuan:** Menambahkan data keranjang dari sesi ke dalam props global yang dikirim ke setiap halaman Inertia (React). Ini membuat data keranjang selalu tersedia di frontend.

### Tahap 2: Frontend (Interaksi & Tampilan)

5.  **Hubungkan Tombol "Tambah ke Keranjang":**
    -   **Aksi:** Perbarui komponen `resources/js/Pages/Product/Show.tsx`.
    -   **Tujuan:** Mengubah event `onClick` pada tombol "Tambah ke Keranjang". Event ini akan memanggil `router.post` dari Inertia untuk mengirim data produk (ID, kuantitas, varian terpilih) ke endpoint `/cart` yang telah dibuat.

6.  **Tampilkan Item Keranjang Secara Dinamis:**
    -   **Aksi:** Modifikasi komponen `resources/js/components/CartSheet.tsx`.
    -   **Tujuan:**
        -   Menggunakan hook `usePage` dari Inertia untuk mengakses data keranjang global.
        -   Melakukan mapping (looping) pada data item keranjang dan menampilkannya dalam daftar.
        -   Menampilkan pesan "Keranjang Anda kosong" jika tidak ada item.
        -   Menghitung dan menampilkan subtotal secara dinamis.