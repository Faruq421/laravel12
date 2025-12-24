import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Link } from '@inertiajs/react';
import { ShoppingCart } from 'lucide-react';
import { ImageWithFallback } from '@/components/ImageWithFallback';
import { ProductQuickView } from '@/components/ProductQuickView'; // Import komponen modal

// Tipe data untuk satu produk
interface Product {
    id_produk: number;
    nama_produk: string;
    slug: string;
    harga: number;
    gambar_url: string;
    category: {
        name: string;
    };
}

// Tipe data untuk props komponen
interface CollectionSectionProps {
    isInView: boolean;
    products: Product[];
}

export default function CollectionSection({ isInView, products }: CollectionSectionProps) {
    const [activeFilter, setActiveFilter] = useState('Newest');
    const filters = ['Newest', 'Top Sell', 'Popular', 'Trending', 'Top Rated'];

    // State untuk mengelola modal Quick View
    const [isQuickViewOpen, setQuickViewOpen] = useState(false);
    const [selectedProductSlug, setSelectedProductSlug] = useState<string | null>(null);

    // Fungsi untuk membuka modal
    const handleOpenQuickView = (slug: string) => {
        setSelectedProductSlug(slug);
        setQuickViewOpen(true);
    };

    return (
        <section className={`bg-slate-50 py-20 text-center transition-all duration-1000 ease-out ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="container mx-auto px-6">
                <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900">Jelajahi Koleksi Kami</h2>
                <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">Temukan produk cetak berkualitas tinggi yang siap mewujudkan ide-ide kreatif Anda.</p>

                <div className="mt-10 flex justify-center bg-gray-200/70 rounded-full p-1 max-w-lg mx-auto">
                    {filters.map((filter) => (
                        <button key={filter} onClick={() => setActiveFilter(filter)} className={`px-4 py-2 text-sm font-semibold rounded-full transition-all duration-300 w-full ${activeFilter === filter ? 'bg-[#FF6500] text-white shadow-md' : 'text-gray-600 hover:bg-white/50'}`}>{filter}</button>
                    ))}
                </div>

                <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {products && products.length > 0 ? (
                        products.map((product) => (
                            <Card key={product.id_produk} className="overflow-hidden group transition-all duration-300 hover:shadow-xl text-left">
                                <CardContent className="p-0">
                                    <Link href={route('products.show', product.slug)}>
                                        <ImageWithFallback
                                            src={product.gambar_url}
                                            alt={product.nama_produk}
                                            className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                                        />
                                        <div className="p-4">
                                            <p className="text-sm text-muted-foreground text-gray-500">{product.category?.name || 'Uncategorized'}</p>
                                            <h3 className="font-semibold truncate mt-1 text-foreground text-gray-900 group-hover:text-[#FF6500] transition-colors">
                                                {product.nama_produk}
                                            </h3>
                                            <p className="text-lg font-bold text-primary text-[#FF6500] mt-2">
                                                Rp {(product.harga || 0).toLocaleString('id-ID')}
                                            </p>
                                        </div>
                                    </Link>
                                </CardContent>
                                <CardFooter
                                    className="p-4 pt-0 overflow-hidden max-h-0 opacity-0 group-hover:max-h-40 group-hover:opacity-100 transition-all duration-500 ease-in-out"
                                >
                                    <Button
                                        className="w-full gap-2 bg-[#FF6500] hover:bg-[#C40C0C] text-white"
                                        variant="default"
                                        onClick={() => handleOpenQuickView(product.slug)}
                                    >
                                        <ShoppingCart className="h-4 w-4" />
                                        Pesan Sekarang
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))
                    ) : (
                        <p className="col-span-4 text-gray-500 mt-8">Saat ini belum ada produk yang ditampilkan.</p>
                    )}
                </div>

                <div className="mt-16">
                    <Button size="lg" variant="outline" className="border-2 border-[#FF6500] text-[#FF6500] hover:bg-[#FF6500] hover:text-white transition-colors duration-300">Lihat Semua Koleksi</Button>
                </div>
            </div>

            {/* Render komponen modal di sini */}
            {selectedProductSlug && (
                <ProductQuickView
                    productSlug={selectedProductSlug}
                    isOpen={isQuickViewOpen}
                    onClose={() => {
                        setQuickViewOpen(false);
                        setSelectedProductSlug(null); // <-- TAMBAHKAN BARIS INI
                    }}
                />
            )}
        </section>
    );
}
