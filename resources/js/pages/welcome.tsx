import { Head } from '@inertiajs/react';
import { type PageProps } from '@/types';
import { Truck, Headset, ShieldCheck, Award } from 'lucide-react';
import React from 'react';

// 1. Impor semua komponen parsial yang telah dibuat menggunakan path alias
import Header from '@/Pages/Welcome/Partials/Header';
import HeroSection from '@/Pages/Welcome/Partials/HeroSection';
import PromoSection from '@/Pages/Welcome/Partials/PromoSection';
import FeaturesSection from '@/Pages/Welcome/Partials/FeaturesSection';
import CategoriesSection from '@/Pages/Welcome/Partials/CategoriesSection';
import CollectionSection from '@/Pages/Welcome/Partials/CollectionSection';
import Footer from '@/Pages/Welcome/Partials/Footer';

// 2. Data dummy (atau data dari props) didefinisikan di sini
const categories = [
    { name: 'Laser Printers', image: 'https://placehold.co/150x150/e0e0e0/757575?text=Laser' },
    { name: 'Printer Ink', image: 'https://placehold.co/150x150/e0e0e0/757575?text=Ink' },
    { name: 'Inkjet Printers', image: 'https://placehold.co/150x150/e0e0e0/757575?text=Inkjet' },
    { name: 'Printer Cartridges', image: 'https://placehold.co/150x150/e0e0e0/757575?text=Cartridge' },
    { name: 'Paper', image: 'https://placehold.co/150x150/e0e0e0/757575?text=Paper' },
    { name: 'Ink Cartridge', image: 'https://placehold.co/150x150/e0e0e0/757575?text=Ink' },
    { name: '3D Printer', image: 'https://placehold.co/150x150/e0e0e0/757575?text=3D' },
];
const saleProducts = [
    { title: 'Winter Sale', price: 150, image: 'https://placehold.co/100x100/e0e0e0/757575?text=Printer' },
    { title: 'Winter Sale', price: 70, image: 'https://placehold.co/100x100/e0e0e0/757575?text=Cartridges' },
    { title: 'Winter Sale', price: 70, image: 'https://placehold.co/100x100/e0e0e0/757575?text=Ink' },
];
const features = [
    { icon: <Truck className="h-8 w-8 text-blue-600" />, title: 'Free Shipping', description: 'On all your order' },
    { icon: <Headset className="h-8 w-8 text-blue-600" />, title: 'Customer Support 24/7', description: 'Instant access to support' },
    { icon: <ShieldCheck className="h-8 w-8 text-blue-600" />, title: '100% Secure Payment', description: 'We ensure your money is safe' },
    { icon: <Award className="h-8 w-8 text-blue-600" />, title: 'Money-Back Guarantee', description: '30 Days Money-Back Guarantee' },
];

export default function Welcome({ auth }: PageProps) {
    return (
        <>
            <Head title="Welcome to Perfect Prints" />
            <div className="bg-gray-50 text-gray-800 font-sans">

                {/* 3. Panggil setiap komponen seperti tag HTML */}

                {/* Kirim 'auth' sebagai props ke Header */}
                <Header auth={auth} />

                <main>
                    <HeroSection />
                    {/* Kirim data yang relevan sebagai props ke komponennya */}
                    <PromoSection saleProducts={saleProducts} />
                    <FeaturesSection features={features} />
                    <CategoriesSection categories={categories} />
                    <CollectionSection />
                </main>

                <Footer />
            </div>
        </>
    );
}

