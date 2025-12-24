import React from 'react';
import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const saleProducts = [
    { title: 'Winter Sale', price: 150, image: 'https://placehold.co/100x100/e0e0e0/757575?text=Printer' },
    { title: 'Winter Sale', price: 70, image: 'https://placehold.co/100x100/e0e0e0/757575?text=Cartridges' },
    { title: 'Winter Sale', price: 70, image: 'https://placehold.co/100x100/e0e0e0/757575?text=Ink' },
];

export default function PromoSection() {
    return (
        <section className="container mx-auto px-6 py-16">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-1 p-8 rounded-lg bg-white flex flex-col justify-center">
                    <h2 className="text-3xl font-bold text-[#C40C0C]">30% OFF</h2>
                    <p className="mt-2 text-gray-600">Power Up Your Printing - Fast, Reliable & Affordable!</p>
                    <Button className="mt-6 bg-[#FF6500] hover:bg-[#C40C0C] text-white">Shop Now</Button>
                </div>
                {saleProducts.map((product, index) => (
                    <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                        <CardContent className="p-4 flex items-center space-x-4">
                            <img src={product.image} alt={product.title} className="w-24 h-24 object-cover rounded-md" />
                            <div>
                                <h3 className="font-semibold text-gray-500">{product.title}</h3>
                                <p className="text-2xl font-bold text-gray-900">${product.price}</p>
                                <Link href="#" className="text-[#FF6500] font-semibold mt-2 inline-block hover:underline">Shop Now</Link>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </section>
    );
}

