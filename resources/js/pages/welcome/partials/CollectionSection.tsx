import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from '@inertiajs/react';
import { ShoppingCart } from 'lucide-react';

const dummyProducts = [
    { name: "Cetak Banner Outdoor", category: "Large Format", price: 125000, image: "https://placehold.co/400x400/FFC100/4A5568?text=Banner", isBestSeller: true },
    { name: "Stiker Vinyl Custom", category: "Sticker", price: 55000, image: "https://placehold.co/400x400/C40C0C/FFFFFF?text=Sticker", isNew: true },
    { name: "Kartu Nama Premium", category: "NameCard", price: 80000, image: "https://placehold.co/400x400/FF8A08/FFFFFF?text=NameCard" },
    { name: "Mug Merchandise Logo", category: "Merchandise", price: 45000, image: "https://placehold.co/400x400/FF6500/FFFFFF?text=Mug" },
    { name: "Roll Up Banner", category: "Display Promotion", price: 250000, image: "https://placehold.co/400x400/f0f0f0/757575?text=Roll+Up" },
    { name: "Cetak Kaos DTF", category: "Garment & Textile", price: 95000, image: "https://placehold.co/400x400/f0f0f0/757575?text=Kaos", isBestSeller: true },
    { name: "Kalender Dinding 2025", category: "Stationary", price: 35000, image: "https://placehold.co/400x400/f0f0f0/757575?text=Kalender", isNew: true },
    { name: "Box Kemasan Produk", category: "Packaging", price: 75000, image: "https://placehold.co/400x400/f0f0f0/757575?text=Box" },
];

export default function CollectionSection({ isInView }: { isInView: boolean }) {
    const [activeFilter, setActiveFilter] = useState('Top Sell');
    const filters = ['Newest', 'Top Sell', 'Popular', 'Trending', 'Top Rated'];

    return (
        <section className={`bg-slate-50 py-20 text-center transition-all duration-1000 ease-out ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="container mx-auto px-6">
                <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900">Jelajahi Koleksi Kami</h2>
                <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">Temukan produk cetak berkualitas tinggi yang siap mewujudkan ide-ide kreatif Anda.</p>
                <div className="mt-10 flex justify-center bg-gray-200/70 rounded-full p-1 max-w-lg mx-auto">{filters.map((filter) => (<button key={filter} onClick={() => setActiveFilter(filter)} className={`px-4 py-2 text-sm font-semibold rounded-full transition-all duration-300 w-full ${activeFilter === filter ? 'bg-[#FF6500] text-white shadow-md' : 'text-gray-600 hover:bg-white/50'}`}>{filter}</button>))}</div>
                <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {dummyProducts.map((p, i) => (
                        <Card key={i} className="text-left rounded-lg overflow-hidden group relative transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl">
                            <div className="relative overflow-hidden"><Link href="#"><img src={p.image} alt={p.name} className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500 ease-in-out" /></Link>{(p.isBestSeller || p.isNew) && (<div className={`absolute top-3 right-3 text-xs font-bold text-white py-1 px-3 rounded-full ${p.isBestSeller ? 'bg-[#C40C0C]' : 'bg-[#FF8A08]'}`}>{p.isBestSeller ? 'Best Seller' : 'Baru'}</div>)}<div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"><div className="absolute bottom-4 left-4 right-4 flex justify-between items-center transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300"><Button asChild size="sm" className="bg-white hover:bg-gray-200 text-gray-800 font-bold shadow-md"><Link href="#">Lihat Detail</Link></Button><Button asChild size="icon" className="bg-[#FF6500] hover:bg-[#C40C0C] text-white shadow-md"><Link href="#"><ShoppingCart className="h-5 w-5" /></Link></Button></div></div></div>
                            <CardContent className="p-5 bg-white"><p className="text-sm text-gray-500">{p.category}</p><h3 className="font-semibold text-lg mt-1 text-gray-800"><Link href="#" className="hover:text-[#FF6500] transition-colors">{p.name}</Link></h3><p className="font-bold text-xl text-gray-900 mt-2">Rp {p.price.toLocaleString('id-ID')}</p></CardContent>
                        </Card>
                    ))}
                </div>
                <div className="mt-16"><Button size="lg" variant="outline" className="border-2 border-[#FF6500] text-[#FF6500] hover:bg-[#FF6500] hover:text-white transition-colors duration-300">Lihat Semua Koleksi</Button></div>
            </div>
        </section>
    );
}
