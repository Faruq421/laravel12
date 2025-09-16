import React from 'react';
import { Zap, Award, FileCheck2, ShieldCheck } from 'lucide-react';

const features = [
    { icon: <Zap className="h-8 w-8 text-[#FF6500]" />, title: 'Pengerjaan Cepat', description: 'Pesanan Anda kami proses secepatnya sesuai antrian.' },
    { icon: <Award className="h-8 w-8 text-[#FF6500]" />, title: 'Garansi Kualitas Cetak', description: 'Kami pastikan hasil cetak tajam dan sesuai standar.' },
    { icon: <FileCheck2 className="h-8 w-8 text-[#FF6500]" />, title: 'Bantuan Cek Desain', description: 'Tim kami siap membantu memeriksa file Anda sebelum cetak.' },
    { icon: <ShieldCheck className="h-8 w-8 text-[#FF6500]" />, title: 'Pembayaran Aman', description: 'Opsi pembayaran lengkap, aman, dan terverifikasi.' },
];

export default function FeaturesSection({ isInView }: { isInView: boolean }) {
    return (
        <section className={`bg-white transition-all duration-1000 ease-out ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="container mx-auto px-6 py-12 ">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
                    {features.map((feature, index) => (
                        <div key={index} className="flex flex-col items-center">
                            {feature.icon}
                            <h3 className="mt-4 font-semibold text-lg text-gray-800">{feature.title}</h3>
                            <p className="text-gray-500 text-sm">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
