Perintah untuk Gemini CLI: Perbaiki File Upload (Revert ke Inertia POST)

Tujuan: Memperbaiki fitur upload desain yang gagal di ProductQuickView.tsx. Kita akan menghapus logika axios.post manual yang bermasalah (yang menyebabkan window.location.reload()) dan menggantinya dengan helper post() standar dari useForm Inertia, yang telah terbukti berfungsi di ProductShowPage.tsx.

File Target: resources/js/components/ProductQuickView.tsx

Tugas 1: Ganti Total Fungsi handleAddToCart

Buka file resources/js/components/ProductQuickView.tsx.

Temukan fungsi handleAddToCart (yang saat ini menggunakan axios.post).

Hapus seluruh isi fungsi tersebut.

Ganti dengan kode baru di bawah ini (menggunakan post standar Inertia):

const handleAddToCart = () => {
    if (!product) return;

    // Gunakan 'post' standar dari useForm.
    // 'data' sudah disinkronkan oleh useEffect.
    post(route('cart.store'), {
        preserveScroll: true,
        onSuccess: () => {
            toast.success(`${product.nama_produk} berhasil ditambahkan.`);
            onClose(); // Tutup modal setelah berhasil (TIDAK RELOAD)
        },
        onError: (errors) => {
            console.error("Cart Add Error:", errors);
            toast.error('Gagal menambahkan produk, periksa kembali pilihan Anda.');
        },
    });
};


Tugas 2: Ganti Total Fungsi handleUpdateCart

Temukan fungsi handleUpdateCart (yang saat ini juga menggunakan axios.post).

Hapus seluruh isi fungsi tersebut.

Ganti dengan kode baru di bawah ini (menggunakan post Inertia dengan method spoofing _method: 'PATCH').

const handleUpdateCart = () => {
    if (!cartItemId || !product) return;

    // Siapkan data untuk dikirim.
    // 'data' (dari useForm) sudah berisi semua state terbaru.
    const formData = {
        ...data,
        _method: 'PATCH' // <-- Method spoofing untuk Laravel
    };

    // Gunakan 'post' Inertia untuk update.
    // Inertia akan otomatis menangani file upload.
    post(route('cart.update', { cartItemId }), {
        data: formData, // Kirim data yang sudah disiapkan
        preserveScroll: true,
        onSuccess: () => {
            toast.success('Keranjang berhasil diperbarui.');
            onClose(); // Tutup modal setelah berhasil (TIDAK RELOAD)
        },
        onError: (errors) => {
            console.error("Cart Update Error:", errors);
            toast.error('Gagal memperbarui keranjang.');
        },
    });
};


Tugas 3: (PENTING) Perbarui Logika useForm dan useEffect

Logika useForm dan useEffect kita menjadi terlalu rumit karena logika axios sebelumnya. Mari kita sederhanakan agar 100% cocok dengan ProductShowPage.tsx.

Temukan useForm (sekitar baris 146).
Ganti kode ini:

const { setData, post, processing, reset, setData: setDataDirectly } = useForm({
  	product_id: product?.id_produk,
  	quantity: 1,
  	variant: {} as Record<string, number>,
  	design: null as { type: 'template' | 'upload', value: number | File | string | null, original_filename?: string } | null,
  	note: "",
});


Dengan kode yang lebih bersih ini:

const { data, setData, post, processing, reset } = useForm({
  	product_id: product?.id_produk,
  	quantity: 1,
  	variant: {} as Record<string, number>,
    // Tipe 'design' disederhanakan agar cocok dengan ProductShowPage
  	design: null as { type: 'template' | 'upload', value: number | File | null } | null,
  	note: "",
});


Temukan useEffect Sinkronisasi Desain (sekitar baris 214).
Ganti kode ini:

useEffect(() => {
  	if (selectedTemplate) {
  	    setData('design', { type: 'template', value: selectedTemplate.id });
  	} else if (uploadedFile) {
  	    setData('design', { type: 'upload', value: uploadedFile });
  	} else if (existingDesign) {
  	    setData('design', { ...existingDesign, type: 'upload' });
  	}
  	else {
  	    setData('design', null);
  	}
}, [selectedTemplate, uploadedFile, existingDesign, setData]);


Dengan kode yang lebih bersih ini (menghapus existingDesign):

useEffect(() => {
  	if (selectedTemplate) {
  	    setData('design', { type: 'template', value: selectedTemplate.id });
  	} else if (uploadedFile) {
  	    setData('design', { type: 'upload', value: uploadedFile });
    // 'existingDesign' akan ditangani saat memuat data, bukan di sini
  	} else if (!isEditMode) { // Hanya reset jika BUKAN mode edit
  	    setData('design', null);
  	}
}, [selectedTemplate, uploadedFile, setData, isEditMode]);
