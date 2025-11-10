Perintah untuk Gemini CLI: Refaktor Total Kartu Produk ShopPage

Tujuan: Mengimplementasikan desain kartu produk Figma yang modern, yang memisahkan tautan "Lihat Detail" dari tombol "Tambah ke Keranjang" yang muncul saat hover.

File Target: resources/js/Pages/Features/Product/ShopPage.tsx

Tugas 1: Impor Fungsionalitas yang Diperlukan

Di bagian atas file ShopPage.tsx, tambahkan impor untuk useForm (untuk menangani POST ke keranjang) dan ikon ShoppingCart:

import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { ShoppingCart } from 'lucide-react'; // <-- TAMBAHKAN INI


Tugas 2: Definisikan Logika addToCart

Di dalam komponen ShopPage, tetapi DI LUAR return statement (di dekat tempat Anda mendefinisikan const { queryParams, ... }), definisikan hook useForm untuk menangani penambahan ke keranjang.

export default function ShopPage() {
    // ... props dan state Anda yang ada ...
    const { queryParams, ... } = useFilters();

    // --- TAMBAHKAN LOGIKA INI ---
    // 'data' di-set ke objek kosong, kita akan mengisinya di onClick
    const { post: addToCartPost, processing: isAddingToCart } = useForm({});

    const handleAddToCart = (productId: number) => {
        // Panggil fungsi post dari useForm
        // Sesuaikan rute 'cart.store' jika nama rute Anda berbeda
        addToCartPost(route('cart.store'), {
            data: {
                product_id: productId,
                quantity: 1, 
                // Tambahkan data lain jika diperlukan (misal: varian)
            },
            preserveScroll: true,
            onSuccess: () => {
                // Opsional: Tampilkan notifikasi "Berhasil ditambah"
                // (Anda mungkin perlu setup 'sonner' atau 'toast')
            },
            onError: () => {
                // Opsional: Tampilkan notifikasi error
            }
        });
    };
    // --- AKHIR LOGIKA TAMBAHAN ---

    // ... sisa logika Anda ...

    return (
        <SiteLayout>
            {/* ... */}


Tugas 3: Rombak Total Struktur Kartu Produk di dalam .map()

Temukan blok displayedProducts.map((product) => ( ... )) dan ganti seluruh kontennya dengan struktur baru ini.

Penting:

Tambahkan className="group" ke komponen <Card> induk.

Bungkus ImageWithFallback DAN div className="p-4" dalam satu <Link>.

Tambahkan <CardFooter> baru setelah div className="p-4" (di luar <Link>).

Terapkan efek hover Figma ke <CardFooter>.

Gunakan onClick pada <Button> baru.

Ganti Kode Lama (Versi CLI Anda):

// --- HAPUS KODE LAMA INI ---
<Card key={product.id_produk} className="overflow-hidden">
    <CardContent className="p-0">
        <Link href={route('products.show', product.slug)}>
            <ImageWithFallback
                src={`/storage/${product.gambar}`}
                alt={product.nama_produk}
                className="w-full h-48 object-cover"
            />
        </Link>
        <div className="p-4">
            <p className="text-sm text-muted-foreground">{product.category.name}</p>
            <h3 className="font-semibold truncate mt-1">
                <Link href={route('products.show', product.slug)}>{product.nama_produk}</Link>
            </h3>
            <p className="text-lg font-bold mt-2">{formatRupiah(product.harga)}</p>
            <Button className="w-full mt-4" asChild>
                <Link href={route('products.show', product.slug)}>Lihat Detail</Link>
            </Button>
        </div>
    </CardContent>
</Card>
// --- AKHIR KODE LAMA ---


Dengan Kode Baru (Struktur Figma + Logika Baru):

// --- GUNAKAN KODE BARU INI ---
<Card key={product.id_produk} className="overflow-hidden group transition-all duration-300 hover:shadow-xl">
    <CardContent className="p-0">
        {/* AKSI 1: Tautan "Lihat Detail" (membungkus gambar & info) */}
        <Link href={route('products.show', product.slug)}>
            <ImageWithFallback
                src={product.gambar_url} // Menggunakan gambar_url dari controller
                alt={product.nama_produk}
                className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="p-4">
                <p className="text-sm text-muted-foreground">{product.category.name}</p>
                <h3 className="font-semibold truncate mt-1 text-foreground">
                    {product.nama_produk}
                </h3>
                <p className="text-lg font-bold text-primary mt-2">
                    {formatRupiah(product.harga)}
                </p>
            </div>
        </Link>
    </CardContent>

    {/* AKSI 2: Tombol "Tambah ke Keranjang" (muncul saat hover) */}
    {/* Ini berada di luar <CardContent> dan di luar <Link> */}
    {/* --- PERUBAHAN DI BAWAH --- */}
    <CardFooter 
        className="p-4 pt-0 overflow-hidden max-h-0 opacity-0 group-hover:max-h-40 group-hover:opacity-100 transition-all duration-300 ease-in-out"
    >
        <Button 
            className="w-full gap-2" 
            variant="default" // Ini akan otomatis menggunakan 'bg-primary'
            onClick={() => handleAddToCart(product.id_produk)}
            disabled={isAddingToCart} // Nonaktifkan saat proses post
        >
            <ShoppingCart className="h-4 w-4" />
            {isAddingToCart ? 'Menambahkan...' : 'Tambah ke Keranjang'}
        </Button>
    </CardFooter>
</Card>
// --- AKHIR KODE BARU ---
