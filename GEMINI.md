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
