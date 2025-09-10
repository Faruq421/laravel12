import React from 'react';
import { Head, usePage } from '@inertiajs/react';
import { type PageProps } from '@/types';
import { useInView } from '@/hooks/useInView';

// Import semua komponen parsial Anda
import Header from '@/pages/welcome/partials/Header';
import HeroSection from '@/pages/welcome/partials/HeroSection';
import PromoSection from '@/pages/welcome/partials/PromoSection';
import FeaturesSection from '@/pages/welcome/partials/FeaturesSection';
import CategoriesSection from '@/pages/welcome/partials/CategoriesSection';
import CollectionSection from '@/pages/welcome/partials/CollectionSection';
import Footer from '@/pages/welcome/partials/Footer';

export default function Welcome({ auth }: PageProps) {
    // Hook 'useInView' tetap digunakan untuk semua bagian KECUALI header
    const [heroRef, heroInView] = useInView({ threshold: 0.2 });
    const [promoRef, promoInView] = useInView({ threshold: 0.2 });
    const [featuresRef, featuresInView] = useInView({ threshold: 0.2 });
    const [categoriesRef, categoriesInView] = useInView({ threshold: 0.2 });
    const [collectionRef, collectionInView] = useInView({ threshold: 0.2 });
    const [footerRef, footerInView] = useInView({ threshold: 0.1 });

    return (
        <>
            <Head title="Welcome to Perfect Prints" />
            <div className="bg-gray-50 text-gray-800 font-sans">

                {/* Header sekarang dipanggil secara normal tanpa prop scroll */}
                <Header auth={auth} />

                <main>
                    <div ref={heroRef}><HeroSection isInView={heroInView} /></div>
                    <div ref={featuresRef}><FeaturesSection isInView={featuresInView} /></div>
                    <div ref={categoriesRef}><CategoriesSection isInView={categoriesInView} /></div>
                    <div ref={collectionRef}><CollectionSection isInView={collectionInView} /></div>
                </main>

                <div ref={footerRef}><Footer isInView={footerInView} /></div>
            </div>
        </>
    );
}

