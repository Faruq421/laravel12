import React from 'react';
import { Head, usePage } from '@inertiajs/react';
import { useInView } from '@/hooks/useInView';

// Import layout utama
import SiteLayout from '@/layouts/SiteLayout';

// Import semua komponen parsial Anda
import HeroSection from '@/pages/welcome/partials/HeroSection';
import FeaturesSection from '@/pages/welcome/partials/FeaturesSection';
import CategoriesSection from '@/pages/welcome/partials/CategoriesSection';
import CollectionSection from '@/pages/welcome/partials/CollectionSection';

// Definisikan tipe data Product di sini agar sesuai dengan data dari backend
interface Product {
    id_produk: number;
    nama_produk: string;
    slug: string; // Pastikan slug ada di sini
    harga: number;
    gambar_url: string;
    category: {
        name: string;
    };
}

// Gunakan tipe Product yang sudah didefinisikan
export default function Welcome() {
    const { products } = usePage<{ products: Product[] }>().props;

    const [heroRef, heroInView] = useInView({ threshold: 0.2 });
    const [featuresRef, featuresInView] = useInView({ threshold: 0.2 });
    const [categoriesRef, categoriesInView] = useInView({ threshold: 0.2 });
    const [collectionRef, collectionInView] = useInView({ threshold: 0.2 });

    return (
        <SiteLayout>
            <Head title="Selamat Datang di Central Printing" />

            {/*
                Render HANYA konten halaman. Header & Footer
                sudah diurus oleh SiteLayout.
            */}
            <div className="bg-gray-50 text-gray-800 font-sans">
                <main>
                    <div ref={heroRef}><HeroSection isInView={heroInView} /></div>
                    <div ref={featuresRef}><FeaturesSection isInView={featuresInView} /></div>
                    <div ref={categoriesRef}><CategoriesSection isInView={categoriesInView} /></div>
                    {/* Kirim prop 'products' ke CollectionSection */}
                    <div ref={collectionRef}>
                        <CollectionSection isInView={collectionInView} products={products} />
                    </div>
                </main>
            </div>
        </SiteLayout>
    );
}
