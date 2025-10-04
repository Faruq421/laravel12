# Rencana Eksekusi: Fitur Master Switch untuk Opsi Desain Produk

## 1. Tujuan Utama

Mengimplementasikan sebuah saklar (switch) utama pada level produk untuk mengaktifkan atau menonaktifkan seluruh fungsionalitas opsi desain (unggah kustom & pilih template) bagi pelanggan. Fitur ini harus nonaktif secara default.

---

## FASE 1: Modifikasi Backend & Database

### Langkah 1.1: Buat Migrasi Database Baru
-   Buat file migrasi baru untuk menambahkan kolom `enable_design_feature` ke tabel `products`.
-   Kolom ini harus bertipe `boolean` dan memiliki nilai default `false`.

### Langkah 1.2: Jalankan Migrasi
-   Terapkan perubahan skema database dengan menjalankan perintah `php artisan migrate`.

### Langkah 1.3: Perbarui Model Product
-   Tambahkan `enable_design_feature` ke dalam properti `$fillable` di model `Product.php` agar dapat diisi secara massal.
-   Tambahkan juga ke properti `$casts` untuk memastikan nilainya selalu bertipe `boolean`.

### Langkah 1.4: Perbarui `ProductController`
-   Tambahkan aturan validasi untuk `enable_design_feature` di dalam metode `validateProduct`.
-   Pastikan nilainya disimpan dengan benar di dalam metode `store` dan `update`.

---

## FASE 2: Penyesuaian Frontend Panel Admin (`FormPage.tsx`)

### Langkah 2.1: Tambahkan Master Switch
-   Di dalam `Card` "Opsi Desain", tambahkan komponen `Switch` baru di bagian paling atas. `Switch` ini akan mengontrol state `data.enable_design_feature`.

### Langkah 2.2: Render Sisa Opsi Secara Kondisional
-   Buat sisa dari `CardContent` (yaitu `Switch` untuk "Izinkan Desain Kustom" dan area unggah *template*) hanya muncul jika `data.enable_design_feature` bernilai `true`.

---

## FASE 3: Penyesuaian Frontend Halaman Detail Produk (`Show.tsx`)

### Langkah 3.1: Render Seluruh Bagian Desain Secara Kondisional
-   Temukan fungsi `renderDesignOptions()` dan bungkus seluruh isinya dengan sebuah kondisi. Fungsi ini hanya akan me-return JSX jika `product.enable_design_feature` bernilai `true`. Jika `false`, fungsi akan me-return `null`.

### Langkah 3.2: Perbarui Logika Tombol "Tambah ke Keranjang"
-   Modifikasi variabel `isDesignSelected`. Jika `product.enable_design_feature` adalah `false`, variabel ini harus selalu `true` (mengabaikan pengecekan desain). Jika `true`, maka logika pengecekan yang ada saat ini akan digunakan.
-   Perbarui juga `getTooltipMessage()` agar tidak meminta pengguna memilih desain jika fiturnya nonaktif.

---
Selesai.
