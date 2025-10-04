# Rencana Eksekusi: Implementasi Opsi Desain Interaktif di Halaman Detail Produk

## 1. Tujuan Utama

Merombak total halaman detail produk (`Product/Show.tsx`) untuk mengintegrasikan sistem pemilihan desain yang interaktif dan kondisional. Pelanggan akan dapat mengunggah desain sendiri atau memilih dari *template* yang disediakan admin, tergantung pada konfigurasi produk. Desain antarmuka akan dibuat modern, bersih, dan sangat ramah pengguna.

---

## FASE 1: Persiapan & Instalasi Komponen UI

### Langkah 1.1: Instal Komponen `shadcn/ui` yang Diperlukan

Kita memerlukan beberapa komponen baru dari `shadcn/ui` untuk membangun antarmuka yang modern. Jalankan perintah berikut untuk menginstal `Tabs` (untuk pilihan unggah/template) dan `Dialog` (untuk pratinjau detail *template*).

```bash
npx shadcn-ui@latest add tabs dialog
```

---

## FASE 2: Refactor Total Halaman Detail Produk (`Product/Show.tsx`)

Ini adalah inti dari perubahan, di mana kita akan mengimplementasikan seluruh logika dan antarmuka baru.

### Langkah 2.1: Impor Dependensi & Manajemen State Baru

-   **Impor:** Tambahkan semua impor yang diperlukan di bagian atas file, termasuk `useState`, `useMemo`, `Tabs`, `Dialog`, `useDropzone`, dan ikon dari `lucide-react`.
-   **State:** Buat beberapa state baru untuk mengelola alur kerja:
    -   `designSource`: Menyimpan pilihan pelanggan ('upload' atau 'template').
    -   `selectedTemplate`: Menyimpan objek *template* yang dipilih pelanggan.
    -   `uploadedFile`: Menyimpan file yang diunggah pelanggan.
    -   `previewUrl`: Menyimpan URL pratinjau untuk file yang diunggah.
    -   `isModalOpen` & `viewingTemplate`: Mengelola state untuk modal pratinjau detail *template*.

### Langkah 2.2: Desain Ulang Struktur Komponen Utama

-   Buat sebuah area baru bernama **"Opsi Desain"** di bawah bagian atribut produk.
-   **Render Kondisional:**
    1.  Jika produk **mengizinkan desain kustom (`allow_custom_design`) DAN memiliki *template* admin**, render komponen `Tabs` dengan dua pilihan: "Unggah Desain Sendiri" dan "Pilih dari Template".
    2.  Jika produk **hanya mengizinkan desain kustom**, render area unggah file secara langsung.
    3.  Jika produk **hanya memiliki *template* admin**, render galeri *template* secara langsung.

### Langkah 2.3: Implementasi Tab/Galeri "Pilih Template"

-   Tampilkan *template* yang tersedia dalam bentuk galeri *thumbnail* (grid).
-   Setiap *thumbnail* akan memiliki efek *hover* dan tombol "Lihat Detail".
-   Ketika *thumbnail* atau tombolnya diklik, state `viewingTemplate` akan diisi dan modal `Dialog` akan terbuka.
-   Jika sebuah *template* sudah dipilih, *thumbnail*-nya akan diberi tanda visual (misalnya, border berwarna).

### Langkah 2.4: Implementasi Tab/Area "Unggah Desain"

-   Gunakan `react-dropzone` untuk membuat area unggah *drag-and-drop* yang intuitif.
-   Setelah file diunggah, tampilkan pratinjau gambar beserta nama file dan tombol untuk menghapus/mengganti file.

### Langkah 2.5: Implementasi Modal Pratinjau Detail Template

-   Gunakan komponen `Dialog` dari `shadcn/ui`.
-   Di dalam modal, tampilkan gambar *template* dalam ukuran yang lebih besar (`DialogContent`) dan namanya (`DialogTitle`).
-   Sediakan tombol "Pilih Template Ini" di dalam modal. Ketika diklik, tombol ini akan mengisi state `selectedTemplate`, menutup modal, dan mengatur `designSource` ke 'template'.

### Langkah 2.6: Logika Cerdas untuk Tombol "Tambah ke Keranjang"

-   Tombol "Tambah ke Keranjang" akan dinonaktifkan secara default.
-   Tombol ini hanya akan aktif jika:
    -   Semua atribut wajib produk (seperti Ukuran, Bahan) telah dipilih.
    -   **DAN** salah satu kondisi desain berikut terpenuhi:
        -   Pelanggan telah memilih *template* dari galeri.
        -   Pelanggan telah mengunggah file desainnya sendiri.
-   Jika tombol dinonaktifkan, gunakan komponen `Tooltip` untuk memberi tahu pengguna langkah apa yang harus diselesaikan.

---

## FASE 3: Penyesuaian Backend (Tugas di Masa Depan)

### Langkah 3.1: Catatan untuk Penanganan Keranjang

-   Perubahan ini hanya berfokus pada *frontend*. Logika untuk menambahkan produk ke keranjang di `CartController` (atau yang setara) perlu diperbarui di masa mendatang untuk dapat menerima dan memproses `uploaded_file` atau `design_template_id`.

---
Selesai.