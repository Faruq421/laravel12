# Perintah Refaktor: Arsitektur Layout Pelanggan

**Tujuan:** Memisahkan layout admin (`AppLayout`) dari layout khusus pelanggan (`SiteLayout`) untuk menciptakan arsitektur frontend yang lebih bersih dan modular.

---

### Tugas 1: Buat Layout Pelanggan (`SiteLayout.tsx`)

1.  **Buat File Baru:** `resources/js/layouts/SiteLayout.tsx`
2.  **Isi File:** Gunakan kode di bawah ini. Layout ini akan menjadi pembungkus utama untuk semua halaman yang dilihat pelanggan, sudah termasuk Header, Footer, dan sistem notifikasi (`Toaster`).

    ```tsx
    import React from 'react';
    import { usePage } from '@inertiajs/react';
    import { type PageProps } from '@/types';

    // Impor Header & Footer dari lokasi komponen layout yang baru
    import SiteHeader from '@/components/layout/SiteHeader';
    import SiteFooter from '@/components/layout/SiteFooter';

    // Impor Toaster/Sonner untuk notifikasi global
    import { Toaster } from '@/components/ui/sonner';

    export default function SiteLayout({ children }: { children: React.ReactNode }) {
        // Ambil 'auth' dari props global untuk diteruskan ke Header
        const { auth } = usePage<PageProps>().props;

        return (
            <div className="flex min-h-screen flex-col">
                {/* Header Situs menerima props 'auth' */}
                <SiteHeader auth={auth} />

                {/* 'children' adalah konten halaman spesifik (Welcome, MyOrders, etc.) */}
                <main className="flex-1">
                    {children}
                </main>

                {/* Footer Situs */}
                <SiteFooter />

                {/* Toaster untuk notifikasi di semua halaman */}
                <Toaster richColors position="top-right" />
            </div>
        );
    }
    ```

---

### Tugas 2: Pindahkan & Sentralisasi Komponen Header

1.  **Buat File Baru:** `resources/js/components/layout/SiteHeader.tsx`
2.  **Pindahkan Kode:** Salin **seluruh isi** dari `resources/js/pages/welcome/partials/Header.tsx` ke dalam file `SiteHeader.tsx` yang baru.
3.  **Hapus File Lama:** Hapus `resources/js/pages/welcome/partials/Header.tsx`.

---

### Tugas 3: Pindahkan & Sentralisasi Komponen Footer

1.  **Buat File Baru:** `resources/js/components/layout/SiteFooter.tsx`
2.  **Pindahkan Kode:** Salin **seluruh isi** dari `resources/js/pages/welcome/partials/Footer.tsx` ke dalam file `SiteFooter.tsx` yang baru.
3.  **Hapus File Lama:** Hapus `resources/js/pages/welcome/partials/Footer.tsx`.

---

### Tugas 4: Refaktor Halaman Utama (`Welcome.tsx`)

1.  **Modifikasi File:** `resources/js/pages/Welcome.tsx`
2.  **Terapkan Perubahan:**
    *   Hapus `import Header` dan `import Footer` dari direktori `partials` yang lama.
    *   Tambahkan `import SiteLayout from '@/layouts/SiteLayout';`.
    *   Ubah struktur komponen untuk menggunakan `SiteLayout` sebagai pembungkus utama.

    **Sebelum:**
    ```tsx
    // ... (import lama)
    export default function Welcome({ auth, ... }) {
        return (
            <>
                <Header auth={auth} />
                <HeroSection />
                {/* ...konten lain... */}
                <Footer />
            </>
        );
    }
    ```

    **Sesudah:**
    ```tsx
    import SiteLayout from '@/layouts/SiteLayout';
    import { Head, usePage } from '@inertiajs/react';
    // ... (import partials halaman lainnya)

    export default function Welcome() {
        const { products } = usePage<{ products: any[] }>().props;

        return (
            <SiteLayout>
                <Head title="Selamat Datang di Central Printing" />

                {/* Render HANYA konten spesifik halaman ini */}
                <HeroSection />
                <FeaturesSection />
                <CategoriesSection />
                <CollectionSection products={products} />
            </SiteLayout>
        );
    }
    ```

---

### Tugas 5: Migrasi Halaman Pesanan Saya (`MyOrdersPage.tsx`)

1.  **Modifikasi File:** `resources/js/pages/Features/Order/MyOrdersPage.tsx`
2.  **Terapkan Perubahan:**
    *   Ganti `import AppLayout from '@/layouts/AppLayout';` dengan `import SiteLayout from '@/layouts/SiteLayout';`.
    *   Ganti pembungkus `<AppLayout>` menjadi `<SiteLayout>`.

---

### Tugas 6: Audit & Migrasi Halaman Pelanggan Lainnya

Tinjau semua file di `resources/js/pages/` (kecuali yang ada di dalam direktori admin) untuk memastikan konsistensi.

#### Halaman Wajib Migrasi:

1.  **Halaman Detail Produk:**
    *   **File:** `resources/js/pages/Features/Product/Show.tsx`
    *   **Tindakan:** Ganti pemanggilan Header dan Footer manual dengan `SiteLayout` sebagai pembungkus utama, mengikuti pola pada Tugas 4 & 5.

2.  **Halaman Autentikasi (jika relevan):**
    *   **File:** `resources/js/pages/Auth/Login.tsx`, `Register.tsx`, `ForgotPassword.tsx`, dll.
    *   **Tindakan:** Periksa apakah halaman ini menggunakan `Header` lama. Jika ya, migrasikan ke `SiteLayout`. Jika halaman ini seharusnya memiliki layout minimalis (tanpa navigasi utama), pastikan mereka menggunakan layout yang sesuai (misalnya `GuestLayout.tsx`) dan tidak memanggil `Header` atau `Footer` secara manual.

#### Peringatan Penting:

*   **Halaman Checkout:** **JANGAN** migrasi `resources/js/pages/Features/Checkout/Index.tsx`. Berdasarkan `GEMINI.md`, halaman ini sengaja menggunakan header minimalis yang berbeda untuk menjaga fokus pengguna. Biarkan konfigurasinya seperti semula.