import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from '@inertiajs/react';
import { ShoppingCart } from 'lucide-react';

// HAPUS 'dummyProducts' dari sini

// Terima 'products' sebagai prop
export default function CollectionSection({ isInView, products }: { isInView: boolean, products: any[] }) {
    const [activeFilter, setActiveFilter] = useState('Newest'); // Ganti default ke Newest
    const filters = ['Newest', 'Top Sell', 'Popular', 'Trending', 'Top Rated'];

    // NOTE: Logika filter belum diimplementasikan di sini.
    // Saat ini, kita hanya menampilkan produk yang dilempar dari controller.

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

                {/* Gunakan prop 'products' untuk me-render list */}
                <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {products.map((product) => (
                        <Card key={product.id} className="text-left rounded-lg overflow-hidden group relative transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl">
                            <div className="relative overflow-hidden">
                                <Link href="#"><img src={product.gambar} alt={product.nama_produk} className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500 ease-in-out" /></Link>

                                {/* NOTE: 'isBestSeller' dan 'isNew' tidak ada di database Anda.
                                  Anda bisa menambahkannya sebagai kolom boolean di tabel 'products' nanti.
                                  Untuk sekarang, kita bisa sembunyikan atau beri logika sementara.
                                */}
                                {/* <div className={`absolute top-3 right-3 text-xs font-bold text-white py-1 px-3 rounded-full bg-[#C40C0C]`}>Best Seller</div> */}

                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                        <Button asChild size="sm" className="bg-white hover:bg-gray-200 text-gray-800 font-bold shadow-md"><Link href="#">Lihat Detail</Link></Button>
                                        <Button asChild size="icon" className="bg-[#FF6500] hover:bg-[#C40C0C] text-white shadow-md"><Link href="#"><ShoppingCart className="h-5 w-5" /></Link></Button>
                                    </div>
                                </div>
                            </div>
                            <CardContent className="p-5 bg-white">
                                {/* Gunakan data dari relasi category */}
                                <p className="text-sm text-gray-500">{product.category.name}</p>
                                <h3 className="font-semibold text-lg mt-1 text-gray-800"><Link href="#" className="hover:text-[#FF6500] transition-colors">{product.nama_produk}</Link></h3>
                                <p className="font-bold text-xl text-gray-900 mt-2">Rp {product.harga.toLocaleString('id-ID')}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="mt-16">
                    <Button size="lg" variant="outline" className="border-2 border-[#FF6500] text-[#FF6500] hover:bg-[#FF6500] hover:text-white transition-colors duration-300">Lihat Semua Koleksi</Button>
                </div>
            </div>
        </section>
    );
}
