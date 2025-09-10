import React, { useState, useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { type PageProps } from '@/types';

// Import semua komponen parsial Anda dengan path yang diperbaiki
import Header from '@/pages/welcome/partials/Header';
import HeroSection from '@/pages/welcome/partials/HeroSection';
import PromoSection from '@/pages/welcome/partials/PromoSection';
import FeaturesSection from '@/pages/welcome/partials/FeaturesSection';
import CategoriesSection from '@/pages/welcome/partials/CategoriesSection';
import CollectionSection from '@/pages/welcome/partials/CollectionSection';
import Footer from '@/pages/welcome/partials/Footer';

export default function Welcome({ auth }: PageProps) {
    // --- LOGIKA ANIMASI SCROLL (DIPINDAHKAN KE SINI) ---
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <>
            <Head title="Welcome to Perfect Prints" />
            <div className="bg-gray-50 text-gray-800 font-sans">

                {/* Kirim status 'isScrolled' sebagai prop ke Header */}
                <Header auth={auth} isScrolled={isScrolled} />

                <main>
                    <HeroSection />
                    <PromoSection />
                    <FeaturesSection />
                    <CategoriesSection />
                    <CollectionSection />
                </main>

                <Footer />
            </div>
        </>
    );
}

