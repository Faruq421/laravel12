# Instruksi Teknis: Refactor Manajemen Template Desain Terintegrasi

## 1. Tujuan Utama

Mengganti sistem manajemen `DesignTemplate` yang berbasis halaman CRUD terpisah dengan alur kerja yang modern dan terintegrasi langsung di dalam halaman "Edit Produk". Admin akan dapat mengunggah *template* baru menggunakan antarmuka *drag-and-drop* dan mengelola *template* yang terhubung dengan produk tanpa pernah meninggalkan halaman produk.

---

## FASE 1: Persiapan Backend (API Endpoint)

### Langkah 1.1: Buat Route API Baru

Buat satu *route* API khusus untuk menangani unggahan *template* desain. Buka file `routes/web.php` dan tambahkan *route* berikut. Kita menggunakan `web.php` alih-alih `api.php` agar tetap berada dalam grup *middleware* yang sama dengan aplikasi utama (termasuk autentikasi sesi).

```php
// routes/web.php

use App\Features\DesignTemplate\DesignTemplateController;

// ... route lainnya

Route::post('/admin/design-templates/upload', [DesignTemplateController::class, 'upload'])
    ->middleware(['auth', 'role:admin'])
    ->name('design-templates.upload');
```

### Langkah 1.2: Buat Metode `upload` di Controller

Buka `app/Features/DesignTemplate/DesignTemplateController.php` dan tambahkan metode `upload` baru. Metode ini akan menangani validasi, penyimpanan file, pembuatan record di database, dan mengembalikan data *template* baru sebagai JSON.

```php
// app/Features/DesignTemplate/DesignTemplateController.php

// Tambahkan di dalam class DesignTemplateController
public function upload(Request $request)
{
    $request->validate([
        'file' => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
    ]);

    $originalName = pathinfo($request->file('file')->getClientOriginalName(), PATHINFO_FILENAME);
    $path = $request->file('file')->store('design-templates/files', 'public');

    $template = DesignTemplate::create([
        'name' => $originalName,
        'thumbnail_path' => $path, // Untuk simple, kita gunakan file yg sama sbg thumbnail
        'file_path' => $path,
    ]);

    return response()->json($template);
}
```

---

## FASE 2: Implementasi Frontend (Drag-and-Drop)

### Langkah 2.1: Instal Pustaka `react-dropzone`

Jalankan perintah berikut di terminal untuk menambahkan fungsionalitas *drag-and-drop* ke proyek:

```bash
npm install react-dropzone
```

### Langkah 2.2: Refactor Total Komponen `Product/FormPage.tsx`

Ini adalah langkah inti. Buka `resources/js/Pages/Features/Product/FormPage.tsx` dan lakukan modifikasi berikut:

1.  **Impor dependensi baru** di bagian atas file.
2.  **Hapus daftar *checkbox* lama** di dalam `Card` "Opsi Desain".
3.  **Implementasikan `useDropzone`** dan logika unggah file.
4.  **Render antarmuka *dropzone*** dan galeri *thumbnail* dari *template* yang sudah terhubung.
5.  **Tambahkan fungsi untuk "melepas"** (*unlink*) *template* dari produk.

Gantilah seluruh isi `Card` "Opsi Desain" dengan kode yang telah diperbarui yang akan mengimplementasikan fungsionalitas ini.

---

## FASE 3: Pembersihan (Cleanup)

### Langkah 3.1: Hapus Halaman `DesignTemplate` yang Tidak Terpakai

Hapus seluruh direktori `resources/js/Pages/Features/DesignTemplate` karena halaman-halaman ini tidak lagi diperlukan.

```bash
# Perintah untuk menghapus direktori (jalankan di terminal)
rm -rf resources/js/Pages/Features/DesignTemplate
```

### Langkah 3.2: Hapus Route Web Lama

Hapus file `routes/features/design-template.php` yang berisi *route* untuk halaman CRUD yang lama.

```bash
# Perintah untuk menghapus file (jalankan di terminal)
rm routes/features/design-template.php
```

### Langkah 3.3: Hapus Metode Controller yang Tidak Terpakai

Buka `app/Features/DesignTemplate/DesignTemplateController.php` dan hapus metode `index`, `create`, `store`, `edit`, `update`, dan `destroy` yang lama. Hanya sisakan metode `upload` yang baru.

### Langkah 3.4: Hapus Link Navigasi Sidebar

Buka `resources/js/components/nav-main.tsx` dan hapus `NavItem` yang mengarah ke `design-templates.index`. Ini akan membersihkan menu admin.

---
Selesai.
