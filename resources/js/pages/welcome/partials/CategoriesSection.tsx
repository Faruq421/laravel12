import React from 'react';
import { Link } from '@inertiajs/react';

const categories = [
    { name: 'Laser Printers', image: 'https://placehold.co/150x150/e0e0e0/757575?text=Laser' },
    { name: 'Printer Ink', image: 'https://placehold.co/150x150/e0e0e0/757575?text=Ink' },
    { name: 'Inkjet Printers', image: 'https://placehold.co/150x150/e0e0e0/757575?text=Inkjet' },
    { name: 'Printer Cartridges', image: 'https://placehold.co/150x150/e0e0e0/757575?text=Cartridge' },
    { name: 'Paper', image: 'https://placehold.co/150x150/e0e0e0/757575?text=Paper' },
    { name: 'Ink Cartridge', image: 'https://placehold.co/150x150/e0e0e0/757575?text=Ink' },
    { name: '3D Printer', image: 'https://placehold.co/150x150/e0e0e0/757575?text=3D' },
];

export default function CategoriesSection() {
    return (
        <section className="container mx-auto px-6 py-16 text-center">
            <p className="font-semibold text-[#FF6500]">Shop by Category</p>
            <h2 className="mt-2 text-4xl font-extrabold text-gray-900">Shop Our Hottest Categories</h2>
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6">
                {categories.map((category, index) => (
                    <Link href="#" key={index} className="group text-center">
                        <div className="w-32 h-32 mx-auto bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border-2 border-transparent group-hover:border-[#FF8A08] transition-all duration-300 transform group-hover:scale-105">
                            <img src={category.image} alt={category.name} className="object-cover w-full h-full" />
                        </div>
                        <h3 className="mt-4 font-semibold text-gray-800 group-hover:text-[#FF6500]">{category.name}</h3>
                    </Link>
                ))}
            </div>
        </section>
    );
}

