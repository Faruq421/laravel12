import React, { useState } from 'react'; // PERBAIKAN: Hapus tanda kutip (') di sekitar useState.
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from '@inertiajs/react';
import { ShoppingCart } from 'lucide-react';

// Tipe data untuk satu produk, agar kode lebih aman dan mudah dibaca
interface Product {
    id_produk: number;
    nama_produk: string;
    slug: string; // <-- Tambahkan slug
    harga: number;
    gambar_url: string; // Menggunakan URL yang sudah diproses dari backend
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
                            <Card key={product.id_produk} className="text-left rounded-lg overflow-hidden group flex flex-col transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl">
                                <Link href={route('products.show', product.slug)} className="flex-grow">
                                    <div className="relative overflow-hidden">
                                        <img
                                            src={product.gambar_url}
                                            alt={product.nama_produk}
                                            className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500 ease-in-out"
                                        />
                                    </div>
                                    <CardContent className="p-5 bg-white">
                                        <p className="text-sm text-gray-500">{product.category?.name || 'Uncategorized'}</p>
                                        <h3 className="font-semibold text-lg mt-1 text-gray-800 group-hover:text-[#FF6500] transition-colors">
                                            {product.nama_produk}
                                        </h3>
                                    </CardContent>
                                </Link>
                                <div className="p-5 bg-white border-t border-gray-100 flex justify-between items-center">
                                    <p className="font-bold text-xl text-gray-900">Rp {product.harga.toLocaleString('id-ID')}</p>
                                    <Button size="icon" className="bg-[#FF6500] hover:bg-[#C40C0C] text-white shadow-md">
                                        <ShoppingCart className="h-5 w-5" />
                                    </Button>
                                </div>
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
        </section>
    );
}
