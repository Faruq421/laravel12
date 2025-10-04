# 💎 Panduan Proyek Gemini

Dokumen ini adalah panduan komprehensif untuk memahami arsitektur, teknologi, dan alur kerja pengembangan proyek Gemini.

---

## 1. Konsep Utama: Scaffolding Berbasis Stub

> Metodologi inti proyek ini adalah **Scaffolding Berbasis Stub**. Alih-alih membuat file secara manual, kita menggunakan perintah `php artisan make:feature` untuk menghasilkan seluruh kerangka fitur (Model, Controller, View React, dll.) dari *template* yang ada di direktori `stubs/feature`. Tujuannya adalah mempercepat pengembangan, memastikan konsistensi kode, dan mengurangi pekerjaan repetitif.

Aplikasi ini adalah web *full-stack* dengan **Laravel** di backend dan **React** (via **Inertia.js**) di frontend, dirancang sebagai fondasi yang kuat untuk aplikasi e-commerce atau sistem manajemen konten yang kompleks.

---

## 2. Tumpukan Teknologi

-   **Backend**: PHP 8.2+, Laravel 12
-   **Frontend**: React 19, TypeScript, Vite, Tailwind CSS 4
-   **Integrasi**: Inertia.js, Ziggy
-   **Komponen UI**: Shadcn/UI, Radix UI, Lucide Icons
-   **Tools**: Composer, NPM, Git, Pest, ESLint, Prettier

---

## 3. Arsitektur & Alur Kerja Inti

Proyek ini menggabungkan **Arsitektur Berbasis Fitur** dengan metodologi **Scaffolding Berbasis Stub**.

#### a. Struktur Direktori Kunci

-   `app/Features`: Pusat logika bisnis, dikelompokkan per fitur.
-   `routes/features`: Rute untuk setiap fitur, dimuat secara otomatis.
-   `resources/js/Pages/Features`: Komponen halaman React, mencerminkan struktur backend.
-   `stubs/feature`: **Cetak Biru Proyek**. Berisi semua *template* yang digunakan untuk *scaffolding*.

#### b. Perintah Utama: `make:feature`

Ini adalah perintah inti untuk memulai fitur baru.

```bash
# Contoh: Membuat fitur untuk manajemen pesanan
php artisan make:feature Order
```

---

## 4. Panduan Setup Cepat

1.  **Instalasi Dependensi:**
    ```bash
    composer install
    npm install
    ```

2.  **Konfigurasi Lingkungan:**
    -   Salin `.env.example` ke `.env`.
    -   Jalankan `php artisan key:generate`.
    -   Sesuaikan koneksi database di `.env`.

3.  **Setup Database:**
    ```bash
    php artisan migrate --seed
    ```

4.  **Jalankan Server Pengembangan:**
    ```bash
    composer dev
    ```
    Aplikasi kini dapat diakses di `http://127.0.0.1:8000`.

---

## 5. Status & Fitur Unggulan

-   [x] **Fondasi & Alur Kerja Solid**: Sistem *scaffolding* (`make:feature`) berfungsi penuh.
-   [x] **Autentikasi & Otorisasi**: Login dan *middleware* berbasis peran (`admin`, `customer`).
-   [x] **Manajemen Produk Lanjutan**: Atribut dinamis, harga varian, dan manajemen inventaris.
-   [x] **Manajemen Desain Terintegrasi**: Antarmuka *drag-and-drop* untukelola *template* desain.
-   [x] **Halaman Detail Produk Interaktif**: Pemilihan varian dengan harga dinamis dan opsi unggah desain.

---

## 6. Alur Kerja Pembaruan Changelog (Semi-Otomatis)

Proyek ini menggunakan alur kerja semi-otomatis untuk mencatat perkembangan.

1.  **Pengembang (Anda):** Selesaikan pekerjaan dan lakukan `git commit` dengan pesan yang jelas.
2.  **Asisten AI (Gemini):** Berikan perintah **"Tolong perbarui changelog"**. Asisten akan menganalisis *commit* terakhir, membuat draf entri, dan meminta persetujuan Anda sebelum menambahkannya.

---

## Riwayat Perubahan

*(Entri baru akan ditambahkan di sini oleh Asisten AI)*

### 4 Oktober 2025
- **Fitur (Backend):** Mengimplementasikan fondasi backend untuk fitur "Opsi Desain" produk, termasuk migrasi, model, dan relasi.
- **Fitur (Backend):** Menambahkan logika lengkap pada `DesignTemplateController` untuk mengelola siklus hidup *template* desain (CRUD, unggah file, dll).
- **Fitur (Admin):** Memperbarui formulir produk (`Product/FormPage.tsx`) dengan `Switch` untuk "Izinkan Desain Kustom" dan `Checkbox` untuk menautkan *template* desain.
- **Refactor (Backend):** Memperbarui `ProductController` untuk menangani penyimpanan dan sinkronisasi relasi *template* desain.
- **Backend:** Memperbarui `ProductController@show` untuk memuat data `designTemplates` terkait di halaman detail produk.

### 4 Oktober 2025
- **Refactor (Frontend):** Merombak total logika halaman detail produk (`Product/Show.tsx`) untuk sistem pemilihan varian yang interaktif dan efisien.
- **Fitur (Frontend):** Mengimplementasikan sistem pemilihan atribut/varian yang wajib; tombol "Tambah ke Keranjang" dinonaktifkan hingga semua opsi dipilih.
- **Fitur (Frontend):** Harga total produk kini diperbarui secara dinamis berdasarkan harga dasar, varian, dan kuantitas.
- **UI/UX (Frontend):** Menambahkan `Tooltip` untuk memberikan umpan balik yang jelas saat tombol "Tambah ke Keranjang" nonaktif.
- **Perbaikan (Frontend):** Mengatasi *crash* pada halaman detail produk dengan menginstal dan mengonfigurasi komponen `RadioGroup` yang hilang.
- **Perbaikan (Kode):** Memperbaiki kesalahan penulisan `import` React.

### 4 Oktober 2025
- **Perbaikan (Backend):** Mengatasi masalah "reload ganda" di seluruh aplikasi dengan menyimpan data `quote` di dalam sesi.
- **Perbaikan (Frontend):** Memperbaiki bug paginasi di halaman produk admin yang selalu kembali ke halaman pertama.

### 4 Oktober 2025
- **Fitur:** Mengimplementasikan halaman detail produk dan fungsionalitas pembaruan produk untuk admin.
- **Backend:** Membuat *route* dan *method controller* yang diperlukan untuk menampilkan dan memperbarui produk.
- **Frontend:** Membangun komponen React baru untuk halaman detail produk.

### 4 Oktober 2025
- **Fitur:** Mengimplementasikan selektor atribut interaktif pada halaman detail produk.
- **Frontend:** Harga produk di halaman detail kini diperbarui secara dinamis berdasarkan pilihan atribut dan kuantitas.
- **Perbaikan (Backend):** Memperbaiki error 404 pada halaman "Tambah/Edit Produk" dengan mengatur ulang prioritas rute.
- **Perbaikan (Backend):** Mengatasi error SQL saat menyimpan produk baru dengan memperbaiki properti `$fillable` di model `Product`.

### 4 Oktober 2025
- **Refactor:** Merombak total halaman detail produk (`Product/Show.tsx`) untuk meningkatkan UI/UX dan kualitas visual.
- **Fitur:** Mengganti notifikasi `Toast` standar dengan `Sonner` untuk umpan balik yang lebih modern.
- **Perbaikan:** Memperbaiki navigasi ke halaman detail produk untuk menggunakan `slug` bukan `ID`.
- **Perbaikan:** Mengatasi masalah "halaman putih" dengan membuat komponen React lebih tangguh terhadap data yang hilang.
- **Chore:** Menambahkan komponen UI (`Separator`, `Sonner`) yang diperlukan dari `shadcn/ui`.

### 2 Oktober 2025
- **Fitur:** Mengganti URL produk dari berbasis ID menjadi berbasis `slug` untuk meningkatkan SEO.
- **Fitur:** Detail produk pada halaman detail kini menampilkan data dinamis dari database.
- **UI/UX:** Menyederhanakan halaman detail produk dengan menghapus galeri thumbnail.
- **Backend:** Menambahkan kolom `slug`, memperbarui model `Product` untuk membuat `slug` otomatis, dan membuat *command* Artisan untuk mengisi `slug` pada data lama.
- **Frontend:** Memperbarui semua tautan produk untuk menggunakan `slug`.

### 2 Oktober 2025
- **Fitur:** Mengimplementasikan halaman detail produk untuk pelanggan.
- **Backend:** Menambahkan *route* dan *method controller* `products.show`.
- **Frontend:** Membuat komponen React baru (`Product/Show.tsx`) dan mendesain tata letaknya.
- **Perbaikan:** Memperbaiki masalah tata letak yang keliru menampilkan *sidebar* admin di halaman detail produk.

### 2 Oktober 2025
- **Refactor:** Mendesain ulang kartu produk pada halaman utama (`CollectionSection.tsx`).
- **UI/UX:** Gambar dan nama produk kini menjadi satu tautan; tombol "Lihat Detail" dihapus; tombol "Add to Cart" dipindahkan.

### 2 Oktober 2025
- **Dokumentasi:** Memperbarui `GEMINI.md` dengan alur kerja baru untuk pencatatan changelog semi-otomatis.