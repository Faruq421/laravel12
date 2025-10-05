# Brief Desain & Teknis v3: Halaman Detail Produk "Semua dalam Satu"

## 1. Visi & Tujuan Utama

Lakukan refactoring total pada file `resources/js/Pages/Features/Product/Show.tsx`. Tujuannya adalah untuk menciptakan sebuah "Pusat Kustomisasi Produk" yang menggabungkan galeri gambar yang elegan (inspirasi dari **Referensi 1**) dengan panel aksi yang sangat fungsional dan informatif (inspirasi dari **Referensi 2**).

Semua fungsionalitas yang sudah ada—pemilihan atribut, pemilihan template desain, dan unggah desain kustom—harus diintegrasikan secara mulus ke dalam desain baru ini, bukan dihilangkan. Pengalaman pengguna harus terasa intuitif, di mana semua pilihan dan informasi berada dalam satu alur yang logis.

## 2. Persyaratan Implementasi Teknis

### a. Struktur & Layout Utama
-   Gunakan layout grid 2 kolom utama (`lg:grid-cols-2`).
-   **Kolom Kiri:** Didedikasikan untuk Galeri Gambar Produk.
-   **Kolom Kanan:** Didedikasikan untuk Panel Aksi & Informasi yang bersifat *sticky*.

### b. Kolom Kiri: Galeri Gambar Interaktif
-   **Komponen Utama:** Gunakan komponen `Carousel` dari `shadcn/ui`.
-   **Gambar Utama:** Tampilkan satu gambar produk yang besar dan jelas.
-   **Galeri Thumbnail:** Di bawah gambar utama, tampilkan galeri *thumbnail* yang dapat di-klik. Galeri ini harus berisi:
    1.  Gambar utama produk (`product.gambar_url`).
    2.  Gambar-gambar produk tambahan (`product.product_images`).
    3.  *Thumbnail* dari semua *template* desain yang tersedia (`product.design_templates`).
-   **Interaktivitas:** Mengklik *thumbnail* (baik itu gambar produk atau *template* desain) harus mengubah gambar utama yang ditampilkan di *carousel*. Ini memberikan visualisasi langsung kepada pengguna.

### c. Kolom Kanan: Panel Aksi & Informasi Terpusat
-   **Wadah Utama:** Bungkus seluruh kolom kanan ini dalam sebuah komponen `<Card>` dari `shadcn/ui` dengan `shadow-lg` agar terlihat menonjol.
-   **Bagian 1: Informasi Produk**
    -   Tampilkan `Breadcrumb` navigasi.
    -   Tampilkan nama kategori, nama produk, dan komponen `StarRating`.
-   **Bagian 2: Pusat Kustomisasi (di dalam `CardContent`)**
    -   Gunakan `<Separator />` untuk memisahkan setiap bagian kustomisasi.
    -   **Pilihan Varian (Atribut):** Untuk setiap grup atribut, gunakan `RadioGroup` dengan `<Label>` yang bisa di-klik. Desainnya harus jelas dan mudah dipilih.
    -   **Opsi Desain:**
        -   Gunakan komponen `Tabs` dengan dua pilihan: "Pilih dari Template" dan "Unggah Desain Sendiri".
        -   **Tab "Pilih dari Template":** Tampilkan galeri kecil dari *thumbnail template* yang tersedia. Memberikan efek visual (misal: border atau ikon centang) pada *template* yang dipilih. Mengklik *template* di sini juga harus mengubah gambar utama di galeri sebelah kiri.
        -   **Tab "Unggah Desain Sendiri":** Gunakan komponen *dropzone* yang sudah ada untuk fungsionalitas unggah. Tampilkan *preview* gambar yang diunggah.
    -   **Jumlah & Catatan:**
        -   Sediakan komponen *stepper* (tombol +/-) untuk input kuantitas.
        -   Sediakan komponen `<Textarea>` untuk catatan pesanan opsional.
-   **Bagian 3: Rekap Harga & Aksi (di dalam `CardFooter`)**
    -   **Rekap Harga Dinamis:**
        -   Tampilkan "Harga Dasar".
        -   Tampilkan "Biaya Tambahan" (dari total harga varian yang dipilih).
        -   Gunakan `<Separator />`.
        -   Tampilkan "Total Harga" akhir dengan font tebal dan ukuran lebih besar.
    -   **Tombol Aksi (CTA):**
        -   Buat tombol "Tambah ke Keranjang" sebagai tombol utama (warna aksen).
        -   Tambahkan tombol "Beli Sekarang" sebagai tombol sekunder (`variant="outline"`).
        -   **Logika Validasi:** Tombol harus *disabled* jika:
            1.  Produk memiliki varian, tetapi belum semuanya dipilih.
            2.  Fitur desain diaktifkan, tetapi pengguna belum memilih *template* atau mengunggah desain.
        -   Gunakan `<Tooltip>` untuk memberikan pesan yang jelas saat tombol *disabled*.

### d. Bagian Bawah Halaman: Informasi Tambahan
-   Di luar grid utama, di bagian bawah halaman, gunakan komponen `Tabs` untuk mengorganisir "Deskripsi Lengkap", "Spesifikasi", dan "Ulasan".

## 3. Output yang Diharapkan

Satu file kode lengkap untuk `resources/js/Pages/Features/Product/Show.tsx` yang sudah dirancang ulang sepenuhnya, memenuhi semua persyaratan di atas. Kode harus bersih, fungsional, dan mengintegrasikan semua fitur pemesanan ke dalam desain baru yang superior.