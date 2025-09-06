import React from 'react';
import { Button } from '@/components/ui/button';

export default function HeroSection() {
    return (
        <section className="bg-gradient-to-r from-blue-50 via-white to-green-50 py-20">
            <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
                <div className="text-center md:text-left">
                    <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight">
                        Perfect Prints,
                        <span className="text-blue-600"> Every Time.</span>
                    </h1>
                    <p className="mt-4 text-lg text-gray-600">
                        Power Up Your Printing - Fast, Reliable & Affordable!
                    </p>
                    <div className="mt-8 flex justify-center md:justify-start space-x-4">
                        <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                            Shop Now &rarr;
                        </Button>
                        <Button size="lg" variant="ghost" className="text-blue-600 hover:bg-blue-50">
                            View Details
                        </Button>
                    </div>
                </div>
                <div>
                    <img src="https://placehold.co/600x400/FFFFFF/000000?text=Epson+Printer" alt="Epson Printer" className="rounded-lg shadow-2xl mx-auto" />
                </div>
            </div>
        </section>
    );
}
