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

---

### Langkah 6: Peningkatan UX - Mencegah Reload Halaman

**Masalah:** Setelah menambahkan produk ke keranjang dari modal *Quick View*, halaman akan me-reload dan scroll kembali ke atas. Ini mengganggu alur belanja pengguna.

**Solusi:** Kita akan menggunakan opsi `preserveScroll` dari Inertia saat mengirimkan form. Opsi ini akan mencegah halaman di-scroll ke atas setelah form berhasil diproses.

1.  **Perbarui `handleAddToCart` di `ProductQuickView.tsx`:**
    -   Buka file `resources/js/components/ProductQuickView.tsx`.
    -   Temukan fungsi `handleAddToCart`.
    -   Tambahkan opsi `{ preserveScroll: true }` ke dalam pemanggilan `post`.

    ```tsx
    // Di dalam ProductQuickView.tsx
    const handleAddToCart = () => {
        if (!product) return;
        post(route('cart.store'), {
            preserveScroll: true, // <-- TAMBAHKAN BARIS INI
            onSuccess: () => {
                toast.success(`${product.nama_produk} berhasil ditambahkan.`);
                onClose();
            },
            onError: () => toast.error('Gagal menambahkan produk.'),
        });
    };
    ```
---

### Langkah 7: Peningkatan UX - Edit Item Langsung dari Keranjang

**Tujuan:** Memungkinkan pengguna mengedit item yang sudah ada di keranjang menggunakan modal *Quick View* yang sama, alih-alih harus menghapus dan menambahkannya kembali.

1.  **Backend: Buat API Endpoint untuk Detail Item Keranjang**
    -   Tujuannya adalah membuat endpoint yang mengembalikan detail lengkap produk **beserta opsi yang sudah dipilih pengguna** (varian, kuantitas, desain, catatan).
    -   Buka `routes/web.php` dan daftarkan route API baru.
        ```php
        // Di dalam routes/web.php, di bawah route API lainnya
        use App\Http\Controllers\Features\CartController;

        Route::get('/api/cart/{cartItemId}', [CartController::class, 'getItemDetails'])->name('cart.itemDetails');
        ```
    -   Buka `app/Http/Controllers/Features/CartController.php` dan tambahkan metode `getItemDetails`.
        ```php
        // Di dalam CartController.php
        use Illuminate\Http\JsonResponse;
        use App\Features\Product\Product; // Pastikan Product di-import

        public function getItemDetails(string $cartItemId): JsonResponse
        {
            $cart = session()->get('cart', []);
            $cartItem = $cart[$cartItemId] ?? null;

            if (!$cartItem) {
                return response()->json(['message' => 'Item tidak ditemukan'], 404);
            }

            // Muat data produk lengkap beserta relasi yang diperlukan oleh Quick View
            $product = Product::with('category', 'attributeValues.attribute', 'designTemplates')
                ->find($cartItem['product_id']);

            if (!$product) {
                return response()->json(['message' => 'Produk tidak ditemukan'], 404);
            }

            // Gabungkan data produk dengan detail pilihan dari sesi
            return response()->json([
                'product' => $product,
                'selectedOptions' => $cartItem,
            ]);
        }
        ```

2.  **Frontend: Tingkatkan Komponen `ProductQuickView.tsx`**
    -   Komponen ini harus bisa beroperasi dalam dua mode: "Tambah Baru" atau "Edit". Kita akan menggunakan `prop` baru untuk membedakannya.
    -   Buka `resources/js/components/ProductQuickView.tsx`.
    -   **Update Props:** Tambahkan `cartItemId` sebagai prop opsional.
        ```tsx
        interface ProductQuickViewProps {
            productSlug?: string | null; // Jadikan opsional
            cartItemId?: string | null; // Prop baru untuk mode edit
            isOpen: boolean;
            onClose: () => void;
        }
        ```
    -   **Update Logika `useEffect`:** Ubah `useEffect` untuk mengambil data berdasarkan `prop` yang diterima.
        ```tsx
        useEffect(() => {
            if (!isOpen) {
                setProduct(null);
                return;
            }
            
            setIsLoading(true);
            const isEditMode = !!cartItemId;
            const url = isEditMode ? `/api/cart/${cartItemId}` : `/api/products/${productSlug}`;

            axios.get(url)
                .then(response => {
                    if (isEditMode) {
                        // Di mode edit, data produk ada di dalam properti 'product'
                        // dan pilihan pengguna ada di 'selectedOptions'
                        setProduct(response.data.product);
                        const { quantity, variant, note, design } = response.data.selectedOptions;
                        // Pre-populate state
                        setQuantity(quantity);
                        setSelectedOptions(variant || {});
                        setNote(note || "");
                        // Logika untuk pre-populate desain akan ditambahkan
                    } else {
                        // Mode tambah baru
                        setProduct(response.data);
                        resetState();
                    }
                })
                .catch(error => console.error("Gagal memuat data:", error))
                .finally(() => setIsLoading(false));
        }, [isOpen, productSlug, cartItemId]);
        ```
    -   **Buat Fungsi `handleUpdateCart`:** Buat fungsi baru untuk mengirim data pembaruan.
        ```tsx
        const { patch } = useForm(/* ... */); // Pastikan patch di-destructure dari useForm

        const handleUpdateCart = () => {
            if (!cartItemId) return;
            patch(route('cart.update', { cartItemId }), {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Keranjang berhasil diperbarui.');
                    onClose();
                },
            });
        };
        ```
    -   **Update Tombol Aksi:** Ubah tombol utama secara dinamis.
        ```tsx
        const isEditMode = !!cartItemId;

        <Button onClick={isEditMode ? handleUpdateCart : handleAddToCart}>
            {isEditMode ? 'Perbarui Pesanan' : 'Tambah ke Keranjang'}
        </Button>
        ```

3.  **Frontend: Integrasi di `CartSheet.tsx`**
    -   Buka `resources/js/components/CartSheet.tsx`.
    -   **Tambahkan State:** Kelola state untuk modal *Quick View*.
        ```tsx
        const [isQuickViewOpen, setQuickViewOpen] = useState(false);
        const [editingCartItemId, setEditingCartItemId] = useState<string | null>(null);

        const handleOpenEdit = (cartItemId: string) => {
            setEditingCartItemId(cartItemId);
            setQuickViewOpen(true);
        };
        ```
    -   **Tambahkan Tombol Edit:** Di dalam loop item keranjang, tambahkan tombol "Edit".
        ```tsx
        // Di dalam .map(item => ...)
        <Button variant="outline" size="sm" onClick={() => handleOpenEdit(item.id)}>
            Edit
        </Button>
        ```
    -   **Render Modal:** Render komponen `ProductQuickView` secara kondisional.
        ```tsx
        // Di bagian akhir dari return JSX
        {editingCartItemId && (
            <ProductQuickView
                cartItemId={editingCartItemId}
                isOpen={isQuickViewOpen}
                onClose={() => setQuickViewOpen(false)}
            />
        )}
        ```
