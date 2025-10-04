# 💎 Panduan Proyek Gemini

Dokumen ini adalah panduan cepat untuk memahami arsitektur, teknologi, dan alur kerja pengembangan proyek ini.

---

## 1. Konsep Utama: Scaffolding Berbasis Stub

Metodologi inti proyek ini adalah **Scaffolding Berbasis Stub**. Alih-alih membuat file secara manual, kita menggunakan perintah `php artisan make:feature` untuk menghasilkan seluruh kerangka fitur (Model, Controller, View React, dll.) dari *template* yang ada di direktori `stubs/feature`.

> **Tujuan:** Mempercepat pengembangan, memastikan konsistensi kode, dan mengurangi pekerjaan repetitif.

Aplikasi ini sendiri adalah sebuah web *full-stack* dengan **Laravel** di backend dan **React** (via **Inertia.js**) di frontend, cocok untuk panel admin, sistem inventaris, atau e-commerce.

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

### a. Struktur Direktori Kunci

-   `app/Features`: Pusat logika bisnis, dikelompokkan per fitur.
-   `routes/features`: Rute untuk setiap fitur, dimuat secara otomatis.
-   `resources/js/Pages/Features`: Komponen halaman React, mencerminkan struktur backend.
-   `stubs/feature`: **Cetak Biru Proyek**. Direktori ini berisi semua *template* yang digunakan untuk *scaffolding*. Jika Anda ingin mengubah struktur file yang dihasilkan, modifikasi file di sini.

### b. Perintah Utama: `make:feature`

Ini adalah satu-satunya perintah yang perlu Anda ingat untuk memulai fitur baru.

```bash
# Contoh: Membuat fitur untuk manajemen kategori produk
php artisan make:feature ProductCategory
```

Perintah ini secara otomatis akan membuat:
-   Model Eloquent
-   File Migrasi Database
-   Controller dengan metode CRUD dasar
-   File Rute
-   Halaman React (`Index.tsx` dan `FormPage.tsx`)
-   Link navigasi di menu sidebar

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
    -   Sesuaikan koneksi database di file `.env`.

3.  **Setup Database:**
    ```bash
    php artisan migrate --seed
    ```

4.  **Jalankan Server Pengembangan:**
    Perintah ini menjalankan server PHP, Vite, dan *queue* secara bersamaan.
    ```bash
    composer dev
    ```
    Aplikasi kini dapat diakses di `http://127.0.0.1:8000`.

---

## 5. Status & Langkah Selanjutnya

-   [x] **Fondasi & Alur Kerja Solid**: Sistem *scaffolding* (`make:feature`) berfungsi penuh.
-   [x] **Autentikasi & Otorisasi**: Login dan *middleware* berbasis peran (`admin`, `customer`) telah diimplementasikan.
-   [x] **Fitur Awal**: Kerangka untuk **Dashboard**, **Produk**, dan **Pelanggan** telah dibuat.

**Langkah Selanjutnya:** Terus kembangkan fungsionalitas baru dengan memanfaatkan perintah `make:feature` dan isi logika bisnis yang spesifik di dalam setiap fitur.

---

## 6. Alur Kerja Pembaruan Changelog (Semi-Otomatis)

Proyek ini menggunakan alur kerja semi-otomatis untuk mencatat perkembangan. Tujuannya adalah agar catatan selalu relevan, terstruktur, dan berkualitas tinggi.

### Langkah 1: Pengembang (Anda)
1.  Selesaikan pekerjaan atau fitur.
2.  Lakukan `git commit` dengan **pesan yang jelas dan deskriptif**. Anda bisa menggunakan Git Desktop atau CLI.
    -   **Contoh Pesan Commit yang Baik:** `Feat: Menambahkan fitur login` atau `Fix: Memperbaiki validasi form produk`.

### Langkah 2: Asisten AI (Gemini)
1.  Setelah Anda siap mencatat kemajuan, berikan perintah sederhana seperti: **"Tolong perbarui changelog"**.
2.  Asisten akan menganalisis *commit* terakhir Anda, membuat draf entri changelog yang detail, dan meminta persetujuan Anda.
3.  Setelah Anda setuju, asisten akan secara otomatis menambahkan entri tersebut di bawah ini.

---

### Riwayat Perubahan

*(Entri baru akan ditambahkan di sini oleh Asisten AI)*

### 4 Oktober 2025
- **Fitur (Backend):** Mengimplementasikan fondasi backend untuk fitur "Opsi Desain" produk, termasuk migrasi database untuk `allow_custom_design` dan tabel `design_templates` beserta relasi *many-to-many* dengan produk.
- **Fitur (Backend):** Menambahkan logika lengkap pada `DesignTemplateController` untuk mengelola siklus hidup *template* desain, termasuk validasi, unggah file (thumbnail & file desain), pembaruan, dan penghapusan file dari *storage*.
- **Fitur (Admin):** Memperbarui formulir produk di dasbor admin (`Product/FormPage.tsx`) dengan menambahkan komponen `Switch` untuk opsi "Izinkan Desain Kustom" dan daftar `Checkbox` untuk menautkan produk dengan *template* desain yang tersedia.
- **Refactor (Backend):** Memperbarui `ProductController` untuk mengirimkan data `designTemplates` ke tampilan formulir dan menangani penyimpanan serta sinkronisasi relasi *template* saat produk dibuat atau diperbarui.
- **Backend:** Memperbarui halaman detail produk sisi pelanggan (`ProductController@show`) untuk memuat data `designTemplates` terkait, mempersiapkan implementasi di *frontend*.

### 4 Oktober 2025
- **Refactor (Frontend):** Merombak total logika halaman detail produk (`Product/Show.tsx`) untuk mengimplementasikan sistem pemilihan varian yang interaktif dan andal, sesuai dengan brief teknis. Kode kini menggunakan `useMemo` untuk mengelompokkan atribut dan menghitung harga secara efisien.
- **Fitur (Frontend):** Mengimplementasikan sistem pemilihan atribut/varian yang wajib. Tombol "Tambah ke Keranjang" kini dinonaktifkan hingga pelanggan memilih satu opsi dari setiap grup atribut yang tersedia (misalnya, Ukuran dan Bahan).
- **Fitur (Frontend):** Harga total produk kini dihitung dan diperbarui secara dinamis di antarmuka pengguna, merefleksikan harga dasar, harga tambahan dari setiap atribut yang dipilih, dan kuantitas.
- **UI/UX (Frontend):** Menambahkan komponen `Tooltip` untuk memberikan umpan balik yang jelas kepada pengguna, menjelaskan mengapa tombol "Tambah ke Keranjang" nonaktif.
- **Perbaikan (Frontend):** Mengatasi *crash* pada halaman detail produk (`Failed to resolve import`) dengan menginstal dan mengonfigurasi komponen `RadioGroup` yang hilang dari `shadcn/ui`.
- **Perbaikan (Kode):** Memperbaiki kesalahan penulisan `import` React yang menyebabkan error pada saat kompilasi.

### 4 Oktober 2025
- **Perbaikan (Backend):** Mengatasi masalah "reload ganda" di seluruh aplikasi. Penyebabnya adalah data `quote` yang selalu berubah di setiap *request*, yang kini dibuat konsisten dengan menyimpannya di dalam sesi.
- **Perbaikan (Frontend):** Memperbaiki bug paginasi di halaman produk admin yang selalu kembali ke halaman pertama. Logika pencarian kini tidak lagi aktif pada saat render awal atau saat berpindah halaman.

### 4 Oktober 2025
- **Fitur:** Mengimplementasikan halaman detail produk, memungkinkan pelanggan untuk melihat informasi lengkap item.
- **Fitur:** Menambahkan fungsionalitas bagi admin untuk memperbarui data produk dari dasbor.
- **Backend:** Membuat *route* dan *method controller* yang diperlukan untuk menampilkan dan memperbarui produk.
- **Frontend:** Membangun komponen React baru untuk halaman detail produk.

### 4 Oktober 2025
- **Fitur:** Mengimplementasikan selektor atribut (misalnya ukuran, bahan) yang interaktif pada halaman detail produk.
- **Frontend:** Harga produk di halaman detail kini diperbarui secara dinamis berdasarkan pilihan atribut dan kuantitas.
- **Perbaikan (Backend):** Memperbaiki error 404 pada halaman "Tambah Produk" dan "Edit Produk" dengan mengatur ulang prioritas rute untuk mengatasi konflik antara rute dinamis (`slug`) dan rute statis (`create`).
- **Perbaikan (Backend):** Mengatasi error SQL saat menyimpan produk baru dengan memperbaiki properti `$fillable` di model `Product` untuk mengizinkan *mass assignment* pada kolom `deskripsi`.

### 4 Oktober 2025
- **Refactor:** Merombak total halaman detail produk (`Product/Show.tsx`) untuk meningkatkan UI/UX, interaktivitas, dan kualitas visual sesuai dengan brief desain.
- **Fitur:** Mengganti notifikasi `Toast` standar dengan `Sonner` untuk umpan balik yang lebih modern saat menambahkan produk ke keranjang.
- **Perbaikan:** Memperbaiki navigasi dari halaman utama ke halaman detail produk dengan mengubah logika controller untuk mencari produk berdasarkan `slug` bukan `ID`.
- **Perbaikan:** Mengatasi masalah "halaman putih" di halaman detail produk dengan membuat komponen React lebih tangguh terhadap data yang hilang (misalnya, produk tanpa atribut atau kategori).
- **Chore:** Menambahkan komponen UI (`Separator`, `Sonner`) yang diperlukan dari `shadcn/ui`.

### 2 Oktober 2025
- **Fitur:** Mengganti URL produk dari berbasis ID menjadi berbasis `slug` untuk meningkatkan SEO dan keterbacaan.
- **Fitur:** Detail produk pada halaman detail kini menampilkan data dinamis dari database.
- **UI/UX:** Menyederhanakan halaman detail produk dengan menghapus galeri thumbnail dan hanya menampilkan satu gambar utama.
- **Backend:**
    - Menambahkan kolom `slug` ke tabel `products` melalui migrasi.
    - Memperbarui model `Product` untuk membuat `slug` secara otomatis saat produk disimpan.
    - Membuat command Artisan `product:generate-slugs` untuk mengisi data `slug` pada produk yang sudah ada.
- **Frontend:**
    - Memperbarui semua tautan produk di halaman utama untuk menggunakan `slug` baru.

### 2 Oktober 2025
- **Fitur:** Mengimplementasikan halaman detail produk untuk pelanggan.
- **Backend:**
    - Menambahkan *route* `products.show` untuk menampilkan satu produk.
    - Membuat method `show` di `ProductController`.
- **Frontend:**
    - Membuat komponen React baru (`Product/Show.tsx`) untuk halaman detail.
    - Mendesain tata letak halaman detail produk yang mencakup galeri gambar, informasi produk, dan tombol aksi.
- **Perbaikan:** Memperbaiki masalah tata letak di mana halaman detail produk keliru menampilkan *sidebar* admin.

### 2 Oktober 2025
- **Refactor:** Mendesain ulang kartu produk pada halaman utama (`CollectionSection.tsx`) untuk meningkatkan pengalaman pengguna.
- **UI/UX:**
    - Gambar dan nama produk kini menjadi satu tautan ke halaman detail.
    - Menghapus tombol "Lihat Detail" yang berlebihan.
    - Memindahkan tombol "Add to Cart" ke posisi yang lebih intuitif.

### 2 Oktober 2025
- **Dokumentasi:** Memperbarui `GEMINI.md` dengan alur kerja baru untuk pencatatan changelog semi-otomatis.
