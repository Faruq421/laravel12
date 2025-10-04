
1. Tujuan Utama
Refactor komponen React Product/Show.tsx untuk mengimplementasikan sistem pemilihan varian produk (atribut) yang interaktif dan andal. Pengguna harus memilih satu opsi dari setiap grup atribut yang tersedia sebelum dapat menambahkan produk ke keranjang.

2. Persona AI
Anda adalah seorang Senior Frontend Developer dengan keahlian pada tumpukan teknologi React, TypeScript, shadcn/ui, dan Inertia.js. Tugas Anda adalah mengimplementasikan logika frontend berdasarkan data yang disediakan oleh backend Laravel.

3. Konteks Data (Props dari Backend)
Asumsikan Anda menerima prop product dari ProductDetailController dengan struktur sebagai berikut. Perhatikan bahwa attribute_values adalah array flat yang berisi semua opsi, dan harga tambahan (price) ada di dalam pivot.

interface ProductData {
    id_produk: number;
    nama_produk: string;
    deskripsi: string;
    harga: number; // Ini adalah harga dasar
    gambar_url: string;
    category: { name: string };
    attribute_values: {
        id: number; // ID unik untuk nilai atribut (misal, ID untuk "Merah")
        value: string; // Nilai dari atribut (misal, "Merah", "Ukuran A4")
        attribute: {
            id: number; // ID unik untuk atribut (misal, ID untuk "Warna")
            name: string; // Nama atribut (misal, "Warna", "Ukuran")
        };
        pivot: {
            price: number; // Harga tambahan untuk opsi ini
        };
    }[];
}

4. Persyaratan Implementasi Frontend
Implementasikan fungsionalitas berikut di dalam file resources/js/Pages/Product/Show.tsx.

a. Manajemen State
Gunakan hook useState untuk mengelola state berikut:

quantity: Tipe number, nilai awal 1.

selectedOptions: Tipe Record<string, number>. State ini akan menyimpan pilihan pengguna dengan format {'attribute_id': 'value_id'}. Contoh: { '1': 5, '2': 8 }.

b. Pengelompokan & Rendering Atribut
Gunakan useMemo untuk mengubah array product.attribute_values yang flat menjadi sebuah objek yang dikelompokkan berdasarkan attribute.name.

Input: [{ attribute: { name: 'Ukuran' } }, { attribute: { name: 'Warna' } }, ...]

Output yang Diharapkan: { "Ukuran": [...], "Warna": [...] }

Render setiap grup atribut ini menggunakan komponen RadioGroup dari shadcn/ui.

Setiap opsi di dalam RadioGroup harus menampilkan nilai (value.value) dan harga tambahannya (value.pivot.price).

Saat sebuah opsi dipilih, panggil fungsi handleOptionChange yang memperbarui state selectedOptions.

c. Logika Harga Dinamis
Gunakan useMemo untuk membuat variabel totalPrice yang nilainya bereaksi terhadap perubahan selectedOptions dan quantity.

Formula Wajib: Total Harga = (Harga Dasar Produk + Total Harga Tambahan dari Atribut Terpilih) * Kuantitas.

Tampilkan totalPrice ini di UI dengan format mata uang Rupiah (toLocaleString('id-ID')).

d. Logika Tombol Aksi Kondisional
Tombol "Tambah ke Keranjang" harus dinonaktifkan (disabled) secara default jika produk memiliki atribut.

Tombol ini hanya menjadi aktif jika kondisi berikut terpenuhi:

Jumlah kunci dalam state selectedOptions SAMA DENGAN jumlah grup atribut unik yang dimiliki produk.
Contoh: Jika produk punya grup "Ukuran" dan "Warna", tombol baru aktif setelah pengguna memilih satu ukuran DAN satu warna.

e. Umpan Balik Notifikasi
Saat tombol "Tambah ke Keranjang" yang sudah aktif di-klik, panggil fungsi handleAddToCart.

Di dalam fungsi ini, gunakan toast.success() dari pustaka sonner untuk menampilkan notifikasi konfirmasi kepada pengguna. Contoh pesan: "[Nama Produk] berhasil ditambahkan ke keranjang."

5. Output yang Diharapkan
Satu file kode lengkap untuk resources/js/Pages/Product/Show.tsx yang telah diperbarui sesuai semua persyaratan teknis di atas.
