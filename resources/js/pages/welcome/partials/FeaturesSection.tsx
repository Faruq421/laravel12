import React from 'react';

interface Feature {
    icon: React.ReactNode;
    title: string;
    description: string;
}

interface FeaturesSectionProps {
    features: Feature[];
}

export default function FeaturesSection({ features }: FeaturesSectionProps) {
    return (
        <section className="bg-white">
            <div className="container mx-auto px-6 py-12 border-t border-b">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
                    {features.map((feature, index) => (
                        <div key={index} className="flex flex-col items-center">
                            {feature.icon}
                            <h3 className="mt-4 font-semibold text-lg">{feature.title}</h3>
                            <p className="text-gray-500 text-sm">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
