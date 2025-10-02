import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import React, { useState } from 'react';
import Header from '@/pages/welcome/partials/Header';
import Footer from '@/pages/welcome/partials/Footer';
import { PageProps as InertiaPageProps } from '@/types';

// Definisikan tipe data untuk props
interface AttributeValue {
    id: number;
    value: string;
    price: number;
    attribute: {
        id: number;
        name: string;
    };
}

interface Category {
    id: number;
    name: string;
}

interface Product {
    id_produk: number;
    nama_produk: string;
    deskripsi: string;
    harga: number;
    gambar_url: string;
    category: Category;
    attributeValues: AttributeValue[];
}

interface PageProps extends InertiaPageProps {
    product: Product;
}

export default function ProductShowPage({ product, auth }: PageProps) {
    const [quantity, setQuantity] = useState(1);
    const [mainImage, setMainImage] = useState(product.gambar_url);

    const imageGallery = [
        product.gambar_url,
        'https://via.placeholder.com/600x600/cccccc/808080?text=Product+View+2',
        'https://via.placeholder.com/600x600/cccccc/808080?text=Product+View+3',
        'https://via.placeholder.com/600x600/cccccc/808080?text=Product+View+4',
    ];

    const incrementQuantity = () => setQuantity(prev => prev + 1);
    const decrementQuantity = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

    return (
        <>
            <Head title={product.nama_produk} />
            <div className="bg-white text-gray-800 font-sans">
                <Header auth={auth} />
                <main>
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                            {/* Kolom Kiri: Galeri Gambar */}
                            <div className="flex flex-col gap-4">
                                <div className="aspect-square w-full overflow-hidden rounded-lg border">
                                    <img
                                        src={mainImage}
                                        alt={product.nama_produk}
                                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                    />
                                </div>
                                <div className="grid grid-cols-4 gap-4">
                                    {imageGallery.map((image, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setMainImage(image)}
                                            className={`aspect-square w-full rounded-md overflow-hidden border-2 transition-all ${mainImage === image ? 'border-[#FF6500]' : 'border-transparent hover:border-gray-300'}`}
                                        >
                                            <img src={image} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Kolom Kanan: Informasi & Aksi */}
                            <div className="flex flex-col gap-6">
                                <div>
                                    <p className="text-sm font-medium text-[#FF6500]">{product.category.name}</p>
                                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-1">{product.nama_produk}</h1>
                                    <p className="text-3xl font-bold text-gray-800 mt-4">Rp {product.harga.toLocaleString('id-ID')}</p>
                                </div>

                                <p className="text-gray-600 leading-relaxed">{product.deskripsi}</p>

                                <div className="flex items-center gap-4">
                                    <h3 className="text-md font-semibold text-gray-800">Jumlah</h3>
                                    <div className="flex items-center border rounded-md">
                                        <Button variant="ghost" size="icon" onClick={decrementQuantity} className="rounded-r-none">
                                            <Minus className="h-4 w-4" />
                                        </Button>
                                        <span className="px-4 font-bold">{quantity}</span>
                                        <Button variant="ghost" size="icon" onClick={incrementQuantity} className="rounded-l-none">
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                                    <Button size="lg" className="bg-[#FF6500] hover:bg-[#e05a00] text-white text-lg w-full">
                                        <ShoppingCart className="mr-2 h-5 w-5" />
                                        Tambah ke Keranjang
                                    </Button>
                                    <Button size="lg" variant="outline" className="border-2 border-[#FF6500] text-[#FF6500] hover:bg-[#FF6500] hover:text-white transition-colors duration-300 text-lg w-full">
                                        Beli Sekarang
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Bagian Bawah: Deskripsi Lengkap & Ulasan */}
                        <div className="mt-20">
                            <div className="border-b">
                                <h2 className="text-2xl font-bold text-gray-900 pb-4">Detail Produk</h2>
                            </div>
                            <div className="prose max-w-none mt-6 text-gray-600">
                                <p>
                                    Ini adalah deskripsi lengkap produk. Anda bisa menambahkan lebih banyak detail di sini,
                                    termasuk spesifikasi teknis, bahan yang digunakan, atau panduan perawatan.
                                </p>
                                <ul>
                                    <li>Bahan: Kertas berkualitas tinggi</li>
                                    <li>Ukuran: 10x15 cm</li>
                                    <li>Finishing: Matte</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </main>
                <Footer isInView={true} />
            </div>
        </>
    );
}