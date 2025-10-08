# Rencana Implementasi: Modal Quick View Produk

Tujuan dari fitur ini adalah untuk memungkinkan pelanggan menambahkan produk ke keranjang langsung dari halaman utama (`Welcome`), bahkan untuk produk yang memerlukan pemilihan opsi (seperti atribut atau desain). Ini akan dilakukan dengan menampilkan modal "Quick View" alih-alih mengarahkan pengguna ke halaman detail produk.

---

### Langkah 1: Penyesuaian Backend - Membuat API Endpoint Khusus

Kita memerlukan endpoint API yang mengembalikan data produk lengkap dalam format JSON, bukan halaman Inertia. Ini akan digunakan oleh modal untuk mengambil detail produk secara dinamis.

1.  **Daftarkan Route API Baru:**
    -   Buka file `routes/web.php`.
    -   Tambahkan route baru yang akan merespons permintaan `GET` ke `/api/products/{product:slug}`.
    -   Route ini akan menunjuk ke metode baru bernama `quickView` di `ProductController`.

    ```php
    // Di dalam routes/web.php
    use App\Features\Product\ProductController;

    Route::get('/api/products/{product:slug}', [ProductController::class, 'quickView'])->name('products.quickView');
    ```

2.  **Buat Metode `quickView` di Controller:**
    -   Buka `app/Features/Product/ProductController.php`.
    -   Buat metode publik baru `quickView(Product $product)`.
    -   Metode ini harus memuat semua relasi yang diperlukan (sama seperti di metode `show`), seperti `attributes.values` dan `designTemplates`.
    -   Kembalikan data produk sebagai `JsonResponse`.

    ```php
    // Di dalam ProductController.php
    use Illuminate\Http\JsonResponse;

    public function quickView(Product $product): JsonResponse
    {
        $product->load(['attributes.values', 'designTemplates']);
        return response()->json($product);
    }
    ```

---

### Langkah 2: Frontend - Membuat Komponen Modal `ProductQuickView`

Komponen ini akan menjadi inti dari fitur ini. Isinya akan sangat mirip dengan halaman `Product/Show.tsx`, tetapi dirancang untuk berjalan di dalam modal.

1.  **Buat File Komponen Baru:**
    -   Buat file baru di `resources/js/components/ProductQuickView.tsx`.

2.  **Struktur Komponen:**
    -   Komponen ini akan menerima `productSlug` dan `isOpen` sebagai props, serta fungsi `onClose` untuk menutup modal.
    -   Gunakan `useState` untuk menyimpan data produk yang diambil dari API (`productData`).
    -   Gunakan `useEffect` untuk mengambil data produk dari endpoint `/api/products/{productSlug}` saat komponen dimuat atau `productSlug` berubah.
    -   Gunakan komponen `Dialog` dari `shadcn/ui` sebagai kerangka modal.
    -   Salin dan adaptasi logika dan JSX dari `resources/js/Pages/Features/Product/Show.tsx` untuk menangani:
        -   Pemilihan atribut/varian.
        -   Opsi desain (unggah kustom & pemilihan template).
        -   Input kuantitas (*quantity stepper*).
        -   Logika `useForm` dari Inertia untuk mengirim data ke `route('cart.store')`.
        -   Tombol "Tambah ke Keranjang" yang dinamis (aktif/nonaktif).

---

### Langkah 3: Frontend - Integrasi Modal ke Halaman Utama

Sekarang kita akan memodifikasi halaman utama untuk menggunakan komponen `ProductQuickView` yang baru.

1.  **Modifikasi `CollectionSection.tsx`:**
    -   Buka `resources/js/pages/Welcome/Partials/CollectionSection.tsx`.
    -   Impor komponen `ProductQuickView` yang baru.
    -   Tambahkan state untuk mengelola modal:
        ```tsx
        const [isQuickViewOpen, setQuickViewOpen] = useState(false);
        const [selectedProductSlug, setSelectedProductSlug] = useState<string | null>(null);
        ```
    -   Buat fungsi untuk membuka modal:
        ```tsx
        const handleOpenQuickView = (slug: string) => {
            setSelectedProductSlug(slug);
            setQuickViewOpen(true);
        };
        ```
    -   Render komponen `ProductQuickView` di bagian bawah JSX, di luar loop `map`:
        ```tsx
        {selectedProductSlug && (
            <ProductQuickView
                productSlug={selectedProductSlug}
                isOpen={isQuickViewOpen}
                onClose={() => setQuickViewOpen(false)}
            />
        )}
        ```

2.  **Modifikasi Tombol di Kartu Produk:**
    -   Di dalam loop `.map` produk di `CollectionSection.tsx`, temukan tombol "Add to Cart".
    -   Ubah `onClick`-nya. Alih-alih menjadi tautan (`Link`) atau aksi langsung, sekarang akan memanggil `handleOpenQuickView` dengan `product.slug`.
    -   Jika produk tidak memiliki varian atau opsi desain, kita bisa mempertimbangkan untuk langsung menambahkannya ke keranjang, tetapi untuk konsistensi, menggunakan modal untuk semua produk adalah pendekatan yang lebih sederhana untuk saat ini.

    ```tsx
    // Contoh modifikasi pada tombol
    <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={() => handleOpenQuickView(product.slug)}
    >
        <ShoppingCart className="mr-2 h-4 w-4" />
        Add to Cart
    </Button>
    ```

---

### Langkah 4: Penyelesaian dan Umpan Balik

1.  **Tutup Modal Setelah Sukses:**
    -   Di dalam komponen `ProductQuickView.tsx`, pada `useForm`, gunakan *callback* `onSuccess` untuk memanggil `onClose` dan mereset state form. Ini akan menutup modal secara otomatis setelah produk berhasil ditambahkan.
    -   Tampilkan notifikasi "toast" (`sonner`) untuk memberi tahu pengguna bahwa item telah ditambahkan ke keranjang.

2.  **Styling dan Finalisasi:**
    -   Pastikan tampilan modal `ProductQuickView` responsif dan terlihat bagus di berbagai ukuran layar.
    -   Pastikan semua state (varian, kuantitas, desain) direset dengan benar saat modal ditutup dan dibuka kembali untuk produk yang berbeda.

---

### Langkah 5: Perbaikan - Modal Gagal Memuat Data

Masalah ini terjadi karena adanya ketidakkonsistenan antara data yang dikirim oleh endpoint API `quickView` dan data yang diharapkan oleh komponen frontend `ProductQuickView.tsx`. Komponen frontend membutuhkan relasi data yang lengkap (seperti kategori dan detail atribut) yang sebelumnya tidak dimuat oleh API.

1.  **Perbaiki Metode `quickView` di Controller:**
    -   Buka `app/Features/Product/ProductController.php`.
    -   Modifikasi metode `quickView` untuk memuat relasi data yang sama persis dengan metode `show`. Ini memastikan bahwa komponen modal menerima semua data yang dibutuhkannya untuk me-render dengan benar.

    ```php
    // Di dalam ProductController.php
    public function quickView(Product $product): JsonResponse
    {
        // PERBAIKAN: Muat relasi yang sama dengan metode show()
        $product->load('category', 'attributeValues.attribute', 'designTemplates');
        return response()->json($product);
    }
    ```

2.  **Verifikasi Ulang Frontend:**
    -   Tidak ada perubahan yang diperlukan di sisi frontend. Komponen `ProductQuickView.tsx` sudah dirancang untuk menangani data yang lengkap. Perbaikan di backend akan secara otomatis menyelesaikan masalah di frontend.
