Perintah untuk Gemini CLI: Refaktor Total Kartu Produk ShopPage (Logika Quick View)

Tujuan: Mengimplementasikan kartu produk yang memicu modal Quick View saat tombol "Pesan" di-klik, alih-alih langsung menambah ke keranjang.

File Target: resources/js/Pages/Features/Product/ShopPage.tsx

Tugas 1: Impor Fungsionalitas yang Diperlukan

Di bagian atas file ShopPage.tsx, hapus useForm dan tambahkan useState. Kita juga perlu mengimpor komponen ProductQuickView Anda (saya berasumsi lokasinya berdasarkan changelog Anda).

// GANTI 'useForm' dengan 'useState'
import { Head, Link, router, usePage, useState } from '@inertiajs/react'; 
import { ShoppingCart } from 'lucide-react'; 

// TAMBAHKAN IMPOR UNTUK MODAL QUICK VIEW
// (Asumsi lokasi file - sesuaikan jika perlu)
import { ProductQuickView } from '@/components/ProductQuickView'; 


Tugas 2: Definisikan Logika QuickView

Di dalam komponen ShopPage, hapus semua logika useForm (handleAddToCart, isAddingToCart). Ganti dengan state dan handler untuk mengelola modal Quick View.

export default function ShopPage() {
    // ... props dan state Anda yang ada ...
    const { queryParams, ... } = useFilters();

    // --- HAPUS LOGIKA useForm INI ---
    // const { post: addToCartPost, processing: isAddingToCart } = useForm({});
    // const handleAddToCart = (productId: number) => { ... };
    // --- AKHIR LOGIKA YANG DIHAPUS ---

    // --- TAMBAHKAN LOGIKA STATE QUICK VIEW INI ---
    const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
    const [selectedProductSlug, setSelectedProductSlug] = useState<string | null>(null);

    const handleOpenQuickView = (slug: string) => {
        setSelectedProductSlug(slug);
        setIsQuickViewOpen(true);
    };

    const handleCloseQuickView = () => {
        setIsQuickViewOpen(false);
        setSelectedProductSlug(null);
    };
    // --- AKHIR LOGIKA TAMBAHAN ---

    // ... sisa logika Anda ...

    return (
        <SiteLayout>
            {/* ... */}


Tugas 3: Rombak Total Struktur Kartu Produk di dalam .map()

Ini sebagian besar sama, tetapi kita akan mengubah onClick dan teks tombol di <CardFooter>.

Ganti Kode Lama (Versi CLI Anda):
(Ini adalah kode dari INTRUKSI.md sebelumnya, Anda tidak perlu menghapus apa pun jika "Pekerja" belum menjalankannya)

Dengan Kode Baru (Struktur Figma + Logika Quick View):

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

    {/* AKSI 2: Tombol "Pesan Sekarang" (memicu Quick View) */}
    {/* Ini berada di luar <CardContent> dan di luar <Link> */}
    <CardFooter 
        className="p-4 pt-0 overflow-hidden max-h-0 opacity-0 group-hover:max-h-40 group-hover:opacity-100 transition-all duration-300 ease-in-out"
    >
        <Button 
            className="w-full gap-2" 
            variant="default" // Ini akan otomatis menggunakan 'bg-primary'
            // --- PERUBAHAN LOGIKA ONCLICK ---
            onClick={() => handleOpenQuickView(product.slug)}
            // --- HAPUS 'disabled' state ---
        >
            <ShoppingCart className="h-4 w-4" />
            {/* --- PERUBAHAN TEKS TOMBOL --- */}
            Pesan Sekarang
        </Button>
    </CardFooter>
</Card>
// --- AKHIR KODE BARU ---


Tugas 4: Render Komponen Modal ProductQuickView

Di dalam return utama ShopPage, tetapi di luar loop .map() (idealnya tepat sebelum </SiteLayout>), kita perlu me-render modal itu sendiri.

    return (
        <SiteLayout>
            {/* ...semua kode halaman Anda (grid, filter, dll)... */}

            {/* --- TAMBAHKAN RENDER MODAL INI DI BAWAH --- */}
            <ProductQuickView
                isOpen={isQuickViewOpen}
                onClose={handleCloseQuickView}
                productSlug={selectedProductSlug}
            />
        </SiteLayout>
    );
}
