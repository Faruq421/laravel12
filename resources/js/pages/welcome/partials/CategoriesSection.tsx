import React from 'react';
import { Link } from '@inertiajs/react';

const categories = [
    { name: 'Digital Printing', image: 'https://placehold.co/300x200/f0f0f0/757575?text=Digital+Print' },
    { name: 'Sticker', image: 'https://placehold.co/300x200/f0f0f0/757575?text=Sticker' },
    { name: 'NameCard & Invitation', image: 'https://placehold.co/300x200/f0f0f0/757575?text=NameCard' },
    { name: 'Display Promotion', image: 'https://placehold.co/300x200/f0f0f0/757575?text=Display' },
    { name: 'Large Format', image: 'https://placehold.co/300x200/f0f0f0/757575?text=Large+Format' },
    { name: 'Garment & Textile', image: 'https://placehold.co/300x200/f0f0f0/757575?text=Garment' },
    { name: 'Stationary', image: 'https://placehold.co/300x200/f0f0f0/757575?text=Stationary' },
    { name: 'Merchandise', image: 'https://placehold.co/300x200/f0f0f0/757575?text=Merch' },
    { name: 'Packaging', image: 'https://placehold.co/300x200/f0f0f0/757575?text=Packaging' },
    { name: 'Home Decor & Photo', image: 'https://placehold.co/300x200/f0f0f0/757575?text=Home+Decor' },
];

export default function CategoriesSection({ isInView }: { isInView: boolean }) {
    return (
        <section className={`container mx-auto px-6 py-16 text-center transition-all duration-1000 ease-out ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <p className="font-semibold text-[#FF6500]">Jelajahi Kategori Kami</p>
            <h2 className="mt-2 text-4xl font-extrabold text-gray-900">Layanan Cetak Paling Populer</h2>
            <div className="mt-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {categories.map((category) => (
                    <Link href="#" key={category.name} className="group text-center">
                        <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
                            <img src={category.image} alt={category.name} className="w-full h-32 object-cover" />
                            <div className="p-4"><h3 className="font-semibold text-gray-800 group-hover:text-[#FF6500] transition-colors">{category.name}</h3></div>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
