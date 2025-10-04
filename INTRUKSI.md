# Rencana Eksekusi: Refactor Total Manajemen Template Desain yang Terintegrasi dan Stateful

## 1. Tujuan Utama

Merombak total alur kerja manajemen *template* desain agar sepenuhnya terintegrasi di dalam form "Tambah/Edit Produk". Tujuannya adalah menciptakan pengalaman pengguna yang intuitif, *stateful*, dan transaksional. Semua perubahan (penambahan atau penghapusan *template*) hanya akan disimpan ke database ketika admin menekan tombol simpan utama, dan bisa dibatalkan jika admin menutup form.

---

## FASE 1: Penyederhanaan Logika Backend

### Langkah 1.1: Kembalikan `DesignTemplateController` ke Fungsi Tunggal

Kita akan menyederhanakan kembali metode `upload` di `DesignTemplateController`. Tujuannya hanya satu: menerima file, menyimpannya, membuat record di tabel `design_templates`, dan mengembalikan data *template* yang baru dibuat sebagai JSON. Logika untuk menautkan *template* ke produk akan dihapus dari sini dan dipindahkan sepenuhnya ke `ProductController`.

---

## FASE 2: Refactor Total Logika Frontend (`FormPage.tsx`)

Ini adalah inti dari perubahan. Kita akan membuat komponen form menjadi "sumber kebenaran tunggal" (*single source of truth*) untuk *template* yang tertaut.

### Langkah 2.1: Ubah Struktur State `useForm`
-   State `design_templates` di dalam `useForm` tidak lagi menyimpan `number[]` (array of IDs), tetapi akan menyimpan `DesignTemplate[]` (array of objects). Ini akan menyederhanakan logika render secara drastis.

### Langkah 2.2: Hapus State Lokal yang Tidak Perlu
-   Hapus `useState` untuk `linkedTemplates`. State ini tidak lagi diperlukan karena kita akan langsung menggunakan `data.design_templates` dari `useForm` untuk me-render daftar *template*.

### Langkah 2.3: Perbarui Logika Unggah (`handleDrop`)
-   Saat unggahan file berhasil dan backend mengembalikan objek *template* baru, logika ini akan **menambahkan objek tersebut ke dalam state `data.design_templates`** menggunakan `setData`.
-   Logika pengiriman `product_id` saat unggah akan dihapus karena tidak relevan lagi.

### Langkah 2.4: Perbarui Logika Hapus (`unlinkTemplate`)
-   Fungsi ini akan dimodifikasi agar hanya menghapus objek *template* dari array `data.design_templates` di dalam `useForm`. Ini murni operasi state di sisi klien.

### Langkah 2.5: Perbarui Logika Render
-   Komponen akan diubah untuk me-render daftar *thumbnail template* dengan melakukan iterasi pada `data.design_templates`.

---

## FASE 3: Finalisasi di `ProductController`

### Langkah 3.1: Sesuaikan Metode `store` dan `update`
-   Karena frontend sekarang mengirimkan array of objects (`[{id: 1, name: '...'}, ...]`) untuk `design_templates`, kita perlu menyesuaikan backend.
-   Sebelum memanggil `sync()`, kita akan mengambil `id` dari setiap objek di dalam array `design_templates` yang diterima.
-   Metode `sync()` kemudian akan dipanggil dengan array ID yang sudah bersih, memastikan semua penambahan dan penghapusan tercermin dengan benar di database saat produk disimpan.

---
Selesai.