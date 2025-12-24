import AppLogo from '@/components/app-logo';
import { Link } from '@inertiajs/react';

export function CheckoutHeader() {
    return (
        <header className="bg-background sticky top-0 z-10 border-b">
            <div className="container flex h-16 items-center justify-center px-4 sm:px-6 lg:px-8">
                <Link href={route('welcome')} className="flex items-center">
                    <AppLogo />
                    <span className="sr-only">Home</span>
                </Link>
            </div>
        </header>
    );
}
