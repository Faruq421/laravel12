import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from '@inertiajs/react';

interface SaleProduct {
    title: string;
    price: number;
    image: string;
}

interface PromoSectionProps {
    saleProducts: SaleProduct[];
}

export default function PromoSection({ saleProducts }: PromoSectionProps) {
    return (
        <section className="container mx-auto px-6 py-16">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-1 p-8 rounded-lg bg-white">
                    <h2 className="text-3xl font-bold">30% OFF</h2>
                    <p className="mt-2 text-gray-600">Power Up Your Printing - Fast, Reliable & Affordable!</p>
                    <Button className="mt-6 bg-blue-600 hover:bg-blue-700">Shop Now</Button>
                </div>
                {saleProducts.map((product, index) => (
                    <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                        <CardContent className="p-4 flex items-center space-x-4">
                            <img src={product.image} alt={product.title} className="w-24 h-24 object-cover rounded-md" />
                            <div>
                                <h3 className="font-semibold text-gray-500">{product.title}</h3>
                                <p className="text-2xl font-bold text-gray-900">${product.price}</p>
                                <Link href="#" className="text-blue-600 font-semibold mt-2 inline-block">Shop Now</Link>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </section>
    );
}
