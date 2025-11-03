import React from 'react';
import { usePage } from '@inertiajs/react';
import { type PageProps } from '@/types';

// Impor Header & Footer dari lokasi BARU
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';

// Impor Toaster/Sonner untuk notifikasi global
import { Toaster } from '@/components/ui/sonner';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
    // Ambil 'auth' dari props global untuk diteruskan ke Header
    const { auth } = usePage<PageProps>().props;

    return (
        <div className="flex min-h-screen flex-col">
            {/* Header Situs menerima props 'auth' */}
            <SiteHeader auth={auth} />

            {/* 'children' adalah konten halaman spesifik (Welcome, MyOrders, etc.) */}
            <main className="flex-1">
                {children}
            </main>

            {/* Footer Situs */}
            <SiteFooter />

            {/* Toaster untuk notifikasi di semua halaman */}
            <Toaster richColors position="top-right" />
        </div>
    );
}
