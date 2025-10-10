import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

// Definisikan tipe untuk setiap langkah, sekarang menyertakan ikon
interface Step {
    name: string;
    icon: React.ReactNode;
}

interface StepperProps {
    steps: Step[];
    currentStep: number;
}

export function Stepper({ steps, currentStep }: StepperProps) {
    return (
        <nav aria-label="Progress">
            <ol role="list" className="grid grid-cols-3 gap-4">
                {steps.map((step, stepIdx) => (
                    <li key={step.name} className="relative">
                        {/* Garis Penghubung, tidak ditampilkan di langkah terakhir */}
                        {stepIdx < steps.length - 1 ? (
                            <div
                                className={cn(
                                    'absolute top-1/2 left-1/2 w-full h-0.5 -translate-y-1/2',
                                    stepIdx < currentStep ? 'bg-orange-500' : 'bg-gray-200'
                                )}
                                aria-hidden="true"
                            />
                        ) : null}

                        <div className="relative flex flex-col items-center text-center">
                            <div
                                className={cn(
                                    'flex h-12 w-12 items-center justify-center rounded-full border-2',
                                    {
                                        'bg-orange-500 border-orange-500 text-white': stepIdx < currentStep,
                                        'border-orange-500 bg-white text-orange-500': stepIdx === currentStep,
                                        'border-gray-300 bg-white text-gray-400': stepIdx > currentStep,
                                    }
                                )}
                            >
                                {stepIdx < currentStep ? <Check className="h-6 w-6" /> : step.icon}
                            </div>
                            <p
                                className={cn('mt-3 font-medium text-sm', {
                                    'text-orange-600 font-semibold': stepIdx === currentStep,
                                    'text-gray-500': stepIdx !== currentStep,
                                })}
                            >
                                {step.name}
                            </p>
                        </div>
                    </li>
                ))}
            </ol>
        </nav>
    );
}
