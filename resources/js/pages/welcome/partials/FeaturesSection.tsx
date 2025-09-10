import React from 'react';
import { Truck, Headset, ShieldCheck, Award } from 'lucide-react';

const features = [
    { icon: <Truck className="h-8 w-8 text-[#FF6500]" />, title: 'Free Shipping', description: 'On all your order' },
    { icon: <Headset className="h-8 w-8 text-[#FF6500]" />, title: 'Customer Support 24/7', description: 'Instant access to support' },
    { icon: <ShieldCheck className="h-8 w-8 text-[#FF6500]" />, title: '100% Secure Payment', description: 'We ensure your money is safe' },
    { icon: <Award className="h-8 w-8 text-[#FF6500]" />, title: 'Money-Back Guarantee', description: '30 Days Money-Back Guarantee' },
];

export default function FeaturesSection() {
    return (
        <section className="bg-white">
            <div className="container mx-auto px-6 py-12 border-t border-b">
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

