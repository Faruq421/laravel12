import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function CollectionSection() {
    return (
        <section className="bg-white py-16 text-center">
            <div className="container mx-auto px-6">
                <h2 className="text-4xl font-extrabold text-gray-900">Discover Our Collection</h2>
                <div className="mt-8 flex justify-center space-x-2 md:space-x-4">
                    <Button variant="ghost" className="text-gray-600">Newest</Button>
                    <Button className="bg-blue-600 hover:bg-blue-700">Top Sell</Button>
                    <Button variant="ghost" className="text-gray-600">Popular</Button>
                    <Button variant="ghost" className="text-gray-600">Trending</Button>
                    <Button variant="ghost" className="text-gray-600">Top Rated</Button>
                </div>
                <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <Card key={i} className="text-left overflow-hidden group">
                            <div className="overflow-hidden">
                                <img src={`https://placehold.co/400x400/f0f0f0/757575?text=Product+${i + 1}`} alt={`Product ${i + 1}`} className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300" />
                            </div>
                            <CardContent className="p-4">
                                <p className="text-sm text-gray-500">Category</p>
                                <h3 className="font-semibold text-lg mt-1">Product Name {i + 1}</h3>
                                <p className="font-bold text-xl text-blue-600 mt-2">$99.00</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
