import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, Zap, Award, ShieldCheck } from 'lucide-react';

const slides = [
    {
        title: "Cetak Banner & Spanduk",
        subtitle: "Warna Tajam, Tahan Lama, Selesai Tepat Waktu.",
        image: "https://placehold.co/600x400/FFC100/4A5568?text=Banner+Promosi",
        ctaText: "Lihat Pilihan Banner",
        ctaLink: "#"
    },
    {
        title: "Stiker & Label Custom",
        subtitle: "Bentuk Apapun, Bahan Apapun. Kualitas Terbaik untuk Brand Anda.",
        image: "https://placehold.co/600x400/C40C0C/FFFFFF?text=Stiker+Custom",
        ctaText: "Pesan Stiker Sekarang",
        ctaLink: "#"
    },
    {
        title: "Merchandise Unik",
        subtitle: "Dari Mug hingga Kaos, Wujudkan Ide Kreatif Anda Bersama Kami.",
        image: "https://placehold.co/600x400/FF8A08/FFFFFF?text=Merchandise",
        ctaText: "Buat Merchandise",
        ctaLink: "#"
    }
];

export default function HeroSection({ isInView }: { isInView: boolean }) {
    const [activeSlide, setActiveSlide] = useState(0);

    const nextSlide = () => {
        setActiveSlide((current) => (current === slides.length - 1 ? 0 : current + 1));
    };

    const prevSlide = () => {
        setActiveSlide((current) => (current === 0 ? slides.length - 1 : current - 1));
    };

    useEffect(() => {
        const timer = setInterval(() => {
            nextSlide();
        }, 5000);
        return () => clearInterval(timer);
    }, [activeSlide]);


    return (
        <section className={`relative bg-gradient-to-r from-yellow-50 via-white to-orange-50 w-full overflow-hidden transition-all duration-1000 ease-out ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="container mx-auto px-6 py-20 min-h-[80vh] flex items-center">
                <div className="relative w-full">
                    {slides.map((slide, index) => (
                        <div key={index} className={`transition-opacity duration-1000 ease-in-out ${index === activeSlide ? 'opacity-100' : 'opacity-0 absolute inset-0'}`}>
                            <div className="grid md:grid-cols-2 gap-12 items-center">
                                <div className="text-center md:text-left">
                                    <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight">
                                        {slide.title},
                                        <span className="text-[#FF6500]"> Kualitas Terbaik.</span>
                                    </h1>
                                    <p className="mt-4 text-lg text-gray-600">
                                        {slide.subtitle}
                                    </p>
                                    <div className="mt-8 flex justify-center md:justify-start space-x-4">
                                        <Button size="lg" className="bg-[#FF6500] hover:bg-[#C40C0C] text-white shadow-lg transform hover:scale-105 transition-transform">
                                            <Link href={slide.ctaLink}>{slide.ctaText}</Link>
                                        </Button>
                                    </div>
                                    <div className="mt-12 border-t pt-6">
                                        <div className="grid grid-cols-3 gap-4 text-center md:text-left">
                                            <div className="flex items-center">
                                                <Zap className="h-6 w-6 text-[#FF8A08]" />
                                                <span className="ml-2 font-semibold text-sm text-gray-700">Proses Cepat</span>
                                            </div>
                                            <div className="flex items-center">
                                                <Award className="h-6 w-6 text-[#FF8A08]" />
                                                <span className="ml-2 font-semibold text-sm text-gray-700">Kualitas Terjamin</span>
                                            </div>
                                            <div className="flex items-center">
                                                <ShieldCheck className="h-6 w-6 text-[#FF8A08]" />
                                                <span className="ml-2 font-semibold text-sm text-gray-700">Harga Terbaik</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <img src={slide.image} alt={slide.title} className="rounded-lg shadow-2xl mx-auto" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <button onClick={prevSlide} className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white/50 hover:bg-white rounded-full p-2 transition-colors">
                    <ChevronLeft className="h-6 w-6 text-gray-800" />
                </button>
                <button onClick={nextSlide} className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white/50 hover:bg-white rounded-full p-2 transition-colors">
                    <ChevronRight className="h-6 w-6 text-gray-800" />
                </button>
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-2">
                    {slides.map((_, index) => (
                        <button key={index} onClick={() => setActiveSlide(index)} className={`h-2 w-2 rounded-full transition-all duration-300 ${index === activeSlide ? 'w-6 bg-[#FF6500]' : 'bg-gray-400'}`}></button>
                    ))}
                </div>
            </div>
        </section>
    );
}

