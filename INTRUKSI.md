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
---

### Langkah 8: Perbaikan Kritis - Fungsionalitas Edit Keranjang

**Masalah:** Fitur edit keranjang memiliki dua bug kritis: 1) Perubahan pada varian/desain tidak disimpan karena backend hanya memproses kuantitas. 2) Tombol "Perbarui Pesanan" menjadi nonaktif secara permanen saat opsi diubah, terutama opsi desain.

**Solusi:** Kita akan merombak metode `update` di backend agar dapat memproses semua data form, dan memperbaiki logika `state` di frontend agar tombol tetap aktif dengan benar.

1.  **Backend: Rombak Metode `update` di `CartController`**
    -   Buka `app/Http/Controllers/Features/CartController.php`.
    -   Ganti metode `update` yang ada dengan versi baru yang lebih komprehensif. Logika ini akan sangat mirip dengan metode `store`, tetapi alih-alih membuat item baru, ia akan menimpa item yang ada dengan data yang diperbarui.
    -   Pastikan untuk menambahkan `use App\Features\Product\Product;` di bagian atas file jika belum ada.

    ```php
    // Di dalam CartController.php, ganti metode update() yang lama
    public function update(Request $request, $cartItemId)
    {
        $request->validate([
            'product_id' => ['required', 'exists:products,id_produk'],
            'quantity' => ['required', 'integer', 'min:1'],
            'variant' => ['nullable', 'array'],
            'design' => ['nullable', 'array'],
            'note' => ['nullable', 'string'],
        ]);

        $cart = session()->get('cart', ['items' => [], 'subtotal' => 0]);

        // Pastikan item yang akan diupdate ada
        if (!isset($cart['items'][$cartItemId])) {
            return redirect()->back()->with('error', 'Item tidak ditemukan di keranjang.');
        }

        $product = Product::findOrFail($request->product_id);

        // Hapus item lama untuk digantikan dengan yang baru
        // Ini adalah cara sederhana untuk memastikan semua data diperbarui
        unset($cart['items'][$cartItemId]);

        // Buat ulang item dengan data baru (mirip dengan metode store)
        $optionsIdentifier = md5(serialize($request->variant) . serialize($request->design));
        $newCartItemId = $product->id_produk . '-' . $optionsIdentifier;

        $variantDetails = $this->getVariantDetails($request->variant);

        $cart['items'][$newCartItemId] = [
            'id' => $newCartItemId,
            'product_id' => $product->id_produk,
            'name' => $product->nama_produk,
            'price' => $product->harga + $variantDetails['price_modifier'],
            'image' => $product->gambar_url,
            'quantity' => $request->quantity,
            'variant' => $request->variant, // Simpan ID varian
            'note' => $request->note,
            'design' => $request->design,
        ];

        $this->recalculateCartSubtotal($cart);
        session()->put('cart', $cart);

        return redirect()->back()->with('success', 'Keranjang berhasil diperbarui!');
    }
    ```

2.  **Frontend: Perbaiki Logika `State` di `ProductQuickView.tsx`**
    -   Buka `resources/js/components/ProductQuickView.tsx`.
    -   **Tambahkan State Baru:** Kita perlu state untuk menyimpan data awal item keranjang agar bisa dibandingkan.
        ```tsx
        // Di bawah state lainnya
        const [initialCartItemOptions, setInitialCartItemOptions] = useState(null);
        ```
    -   **Update `useEffect`:** Simpan data `selectedOptions` saat memuat data dalam mode edit.
        ```tsx
        // Di dalam blok if (isEditMode) di useEffect
        setInitialCartItemOptions(response.data.selectedOptions); 
        ```
    -   **Perbaiki Logika `isDesignSelected`:** Buat logika ini lebih cerdas dengan memeriksa apakah desain sudah ada dari awal.
        ```tsx
        // Ganti deklarasi isDesignSelected yang lama
        const hasInitialDesign = !!initialCartItemOptions?.design;
        const isDesignSelected = !product?.enable_design_feature || 
                                 !!selectedTemplate || 
                                 !!uploadedFile || 
                                 (isEditMode && haInitialDesign && !selectedTemplate && !uploadedFile);
        ```
        Logika baru ini berarti: "Desain dianggap terpilih jika: fitur desain nonaktif, ATAU template baru dipilih, ATAU file baru diunggah, ATAU (dalam mode edit) pengguna belum memilih yang baru TAPI item aslinya sudah memiliki desain."
---

### Langkah 9: Perbaikan Stabilitas - Mencegah State Contamination

**Masalah:** Setelah menggunakan modal *Quick View* dalam mode "Edit" dan menutupnya, membukanya kembali dalam mode "Tambah" (dari halaman utama) menyebabkan *crash* (layar putih). Ini terjadi karena *state* dari `useForm` (termasuk data dan *error*) tidak direset sepenuhnya, menyebabkan inkonsistensi data.

**Solusi:** Kita akan memastikan semua *state*, terutama dari `useForm`, direset total setiap kali modal ditutup atau dibuka untuk item baru.

1.  **Sempurnakan Reset State di `ProductQuickView.tsx`**
    -   Buka `resources/js/components/ProductQuickView.tsx`.
    -   Di dalam `useForm`, *destructure* fungsi `reset`.
        ```tsx
        const { data, setData, post, patch, processing, reset } = useForm({ /* ... */ });
        ```
    -   Perbarui fungsi `resetState` untuk memanggil `reset()` dari `useForm`. Ini akan membersihkan semua data, *error*, dan status internal dari form Inertia.
        ```tsx
        const resetState = () => {
            reset(); // <-- TAMBAHKAN BARIS INI
            setQuantity(1);
            setSelectedOptions({});
            // ... sisa fungsi resetState
        };
        ```

2.  **Pastikan Reset Penuh di `CollectionSection.tsx`**
    -   Buka `resources/js/pages/Welcome/Partials/CollectionSection.tsx`.
    -   Modifikasi fungsi `onClose` untuk me-reset `selectedProductSlug` menjadi `null`. Ini memastikan bahwa komponen `ProductQuickView` di-unmount dan di-mount kembali dengan *props* yang bersih setiap kali dibuka, mencegah sisa *state* dari penggunaan sebelumnya.
        ```tsx
        // Ganti onClose yang lama
        onClose={() => {
            setQuickViewOpen(false);
            setSelectedProductSlug(null); // <-- TAMBAHKAN BARIS INI
        }}
        ```

---

### Langkah 10: Perbaikan Stabilitas - Mencegah "Uncontrolled to Controlled" Warning

**Masalah:** Saat mengedit item dari keranjang, konsol menampilkan peringatan `RadioGroup is changing from uncontrolled to controlled`. Ini terjadi karena nilai awal untuk `RadioGroup` (varian produk) adalah `undefined` saat komponen pertama kali render, sebelum state pilihan pengguna dimuat. Peralihan ini menyebabkan render yang tidak stabil dan dapat secara keliru menonaktifkan tombol "Perbarui Pesanan".

**Solusi:** Kita akan memastikan komponen `RadioGroup` selalu "terkontrol" sejak awal dengan memberikan nilai fallback berupa string kosong (`''`) jika nilai yang sebenarnya belum tersedia.

1.  **Perbaiki Komponen `RadioGroup` di `ProductQuickView.tsx`**
    -   Buka `resources/js/components/ProductQuickView.tsx`.
    -   Cari baris di mana `RadioGroup` di-render.
    -   Modifikasi prop `value` untuk menyertakan fallback `|| ''`.

    ```tsx
    // Di dalam ProductQuickView.tsx, di dalam .map untuk attributeGroups

    // Ganti baris ini:
    <RadioGroup onValueChange={...} value={selectedOptions[values[0].attribute.id]?.toString()} ...>

    // Menjadi seperti ini:
    <RadioGroup onValueChange={...} value={selectedOptions[values[0].attribute.id]?.toString() || ''} ...>
    ```

---

### Langkah 11: Perbaikan Kritis - Konsistensi Data Keranjang & Logika Kuantitas

**Masalah:** Ditemukan beberapa bug kritis yang saling berhubungan: 1) Desain kustom yang diunggah tidak tersimpan di keranjang. 2) Jumlah total item di ikon keranjang menampilkan angka yang salah dan sangat besar. 3) Memperbarui item dengan desain kustom gagal.

**Akar Masalah:** Penyebab utamanya adalah inkonsistensi data di `CartController`. Metode `store` (untuk item baru) menyimpan data varian dalam format string, sementara metode `update` menyimpannya dalam format array mentah. Ketidakcocokan ini menyebabkan logika untuk memeriksa item yang sudah ada selalu gagal, sehingga item baru selalu ditambahkan alih-alih kuantitasnya diperbarui. Ini merusak struktur data sesi keranjang dan menyebabkan semua gejala di atas.

**Solusi:** Kita akan membuat metode `store` konsisten dengan `update` dengan cara menyimpan data `variant` mentah langsung dari request.

1.  **Perbaiki Logika Penyimpanan Varian di `CartController.php`**
    -   Buka `app/Http/Controllers/Features/CartController.php`.
    -   Di dalam metode `store`, cari baris di mana item baru ditambahkan ke keranjang.
    -   Ubah nilai dari kunci `'variant'` agar menyimpan `$request->variant` secara langsung, bukan hasil dari `$this->getVariantDetails`.

    ```php
    // Di dalam CartController.php -> store()

    // Ganti baris ini:
    'variant' => $variantDetails['details'],

    // Menjadi seperti ini:
    'variant' => $request->variant,
    ```

---

### Langkah 12: Perbaikan Kritis Final - Stabilitas Keranjang & Kalkulasi Kuantitas

**Masalah:** Bug "jumlah keranjang salah" (`01` atau `31`) dan kegagalan update desain masih terjadi. Ini disebabkan oleh dua masalah: 1) Logika kalkulasi jumlah total item di `HandleInertiaRequests` salah. 2) Metode `update` di `CartController` menggunakan strategi "hapus dan buat ulang" yang tidak stabil dan rawan kesalahan saat ID item berubah.

**Solusi:** Kita akan melakukan dua perbaikan final untuk menstabilkan seluruh sistem keranjang.

1.  **Perbaiki Kalkulasi Total Kuantitas Keranjang:**
    -   Buka `app/Http/Middleware/HandleInertiaRequests.php`.
    -   Cari metode `share`. Di dalamnya, temukan logika yang menghitung `cart.quantity`.
    -   Ganti logika tersebut dengan cara yang aman dan benar: menjumlahkan nilai `quantity` dari semua item di dalam keranjang.

    ```php
    // Di dalam HandleInertiaRequests.php -> share()

    'cart' => function () {
        $cart = session('cart', ['items' => [], 'subtotal' => 0]);
        // PERBAIKAN: Ganti count() dengan kalkulasi yang benar
        $quantity = is_array($cart['items']) ? array_sum(array_column($cart['items'], 'quantity')) : 0;
        return [
            'items' => $cart['items'],
            'subtotal' => $cart['subtotal'],
            'quantity' => $quantity,
        ];
    },
    ```

2.  **Refactor Metode `update` di `CartController` agar Lebih Aman:**
    -   Buka `app/Http/Controllers/Features/CartController.php`.
    -   Ganti seluruh metode `update` dengan versi baru yang memodifikasi item secara langsung di dalam sesi (*in-place*). Ini menghilangkan kebutuhan untuk menghapus dan membuat ulang item, sehingga jauh lebih stabil dan tidak bergantung pada pembuatan ulang ID yang cocok.

    ```php
    // Di dalam CartController.php, ganti seluruh metode update()
    public function update(Request $request, $cartItemId)
    {
        $request->validate([
            'quantity' => ['required', 'integer', 'min:1'],
            'note' => ['nullable', 'string'],
            // Validasi lain bisa ditambahkan jika perlu
        ]);

        $cart = session()->get('cart', ['items' => [], 'subtotal' => 0]);

        // Pastikan item ada sebelum diupdate
        if (!isset($cart['items'][$cartItemId])) {
            return redirect()->back()->with('error', 'Item tidak ditemukan di keranjang.');
        }

        // Proses desain baru jika ada
        $designData = $this->processDesignData($request);

        // Update data item secara langsung
        $cart['items'][$cartItemId]['quantity'] = $request->quantity;
        $cart['items'][$cartItemId]['note'] = $request->note;
        
        // Hanya perbarui desain jika ada data desain baru yang valid
        if ($designData) {
            $cart['items'][$cartItemId]['design'] = $designData;
        }

        // Hitung ulang subtotal dan simpan ke sesi
        $this->recalculateCartSubtotal($cart);
        session()->put('cart', $cart);

        return redirect()->back()->with('success', 'Keranjang berhasil diperbarui!');
    }
    ```
---

### Langkah 13: Perbaikan Kritis - Penanganan Unggahan File Desain

**Masalah:** Bug paling krusial yang tersisa adalah file desain kustom yang diunggah oleh pelanggan tidak pernah benar-benar disimpan di server. Akibatnya, data desain di keranjang tidak valid dan tidak bisa digunakan lebih lanjut.

**Akar Masalah:** Logika di dalam metode `processDesignData` pada `CartController` tidak cukup tangguh. Metode tersebut gagal mengidentifikasi file yang diunggah dengan benar dari struktur data request yang dikirim oleh Inertia, terutama karena pengecekan `$request->hasFile('design.value')` tidak selalu berhasil dalam semua skenario.

**Solusi:** Kita akan merombak total metode `processDesignData` agar lebih eksplisit dan aman dalam menangani data desain. Logika baru ini akan secara spesifik memeriksa `design.type` terlebih dahulu.

1.  **Refactor Metode `processDesignData` di `CartController`:**
    -   Buka `app/Http/Controllers/Features/CartController.php`.
    -   Ganti seluruh metode `processDesignData` dengan versi baru yang lebih andal.

    ```php
    // Di dalam CartController.php, ganti seluruh metode processDesignData()
    private function processDesignData(Request $request): ?array
    {
        // Ambil tipe desain dari input, default null jika tidak ada.
        $designType = $request->input('design.type');

        // Kasus 1: Unggahan Desain Kustom
        if ($designType === 'upload' && $request->hasFile('design.value')) {
            $file = $request->file('design.value');
            $path = $file->store('public/designs');
            
            return [
                'type' => 'upload',
                'value' => str_replace('public/', '', $path),
                'original_filename' => $file->getClientOriginalName(),
            ];
        }

        // Kasus 2: Pemilihan Template
        if ($designType === 'template' && $request->filled('design.value')) {
            return [
                'type' => 'template',
                'value' => $request->input('design.value'),
            ];
        }

        // Kasus 3: Tidak ada desain atau data tidak valid
        return null;
    }
    ```
    Perbaikan ini memastikan bahwa file yang diunggah akan selalu terdeteksi, disimpan ke `storage/app/public/designs`, dan path-nya yang benar disimpan ke dalam sesi keranjang. Ini menyelesaikan bug inti yang dilaporkan.
---

### Langkah 14: Perbaikan Komprehensif - Alur Edit Desain Kustom

**Masalah:** Alur untuk mengedit item dengan desain kustom di keranjang rusak. Desain yang sudah ada tidak ditampilkan di modal, dan saat memperbarui item (misalnya, hanya mengubah kuantitas), desain yang ada malah terhapus dari sesi.

**Solusi:** Perbaikan ini melibatkan backend dan frontend untuk memastikan desain kustom ditangani dengan benar selama siklus edit.

1.  **Backend: `processDesignData` Dibuat Lebih Cerdas**
    -   Buka `app/Http/Controllers/Features/CartController.php`.
    -   Metode `processDesignData` diubah untuk mengenali tiga skenario: (1) unggahan file baru, (2) pemilihan template baru, dan (3) **data desain lama yang dikirim kembali oleh frontend**. Ini mencegah desain terhapus secara tidak sengaja.

    ```php
    // Di dalam CartController.php -> processDesignData()
    // ... (kode sudah diperbarui di langkah sebelumnya)
    // Logika baru dapat membedakan antara file baru dan path file lama (string).
    ```

2.  **Frontend: Menampilkan Desain yang Ada & Pengiriman Data yang Benar**
    -   Buka `resources/js/components/ProductQuickView.tsx`.
    -   **State Baru:** Menambahkan state `existingDesign` untuk menyimpan detail desain yang sudah ada saat komponen dimuat dalam mode edit.
    -   **Tampilan Pratinjau:** JSX diperbarui untuk menampilkan pratinjau gambar dan nama file dari `existingDesign`, memberikan umpan balik visual kepada pengguna.
    -   **Logika Pengiriman:** Fungsi `handleUpdateCart` diubah untuk menggunakan metode `POST` dengan `_method: 'PATCH'` untuk pengiriman `FormData` yang andal, memastikan file (atau path file lama) dikirim dengan benar.

    ```tsx
    // Di dalam ProductQuickView.tsx

    // Menampilkan pratinjau desain yang ada
    {existingDesign ? (
        <div className='...'>
            <img src={`/storage/${existingDesign.value}`} />
            <p>{existingDesign.original_filename}</p>
        </div>
    ) : ( /* Tampilkan dropzone */ )}

    // Logika baru di handleUpdateCart untuk mengirim FormData
    post(route('cart.update', { cartItemId }), {
        forceFormData: true,
        _method: 'PATCH',
        // ...data lainnya
    });
    ```
