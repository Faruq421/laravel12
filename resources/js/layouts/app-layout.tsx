import { type ReactNode, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { Toaster, toast } from 'sonner';
import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';

// Definisikan tipe untuk flash message agar lebih aman
interface FlashMessage {
    message?: string;
}

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => {
    // Gunakan usePage untuk mengakses props, termasuk flash message
    const page = usePage();
    const flash = page.props.flash as FlashMessage;

    // Gunakan useEffect untuk "mendengarkan" perubahan pada flash message
    useEffect(() => {
        if (flash && flash.message) {
            // Tampilkan notifikasi yang elegan saat ada pesan baru
            toast.success(flash.message, {
                position: 'top-center',
                duration: 3000,
            });
        }
    }, [flash]);

    return (
        <>
            {/* Letakkan komponen Toaster di sini, di luar template utama */}
            <Toaster richColors closeButton />

            <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
                {children}
            </AppLayoutTemplate>
        </>
    );
};

