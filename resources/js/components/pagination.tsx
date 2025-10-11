import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';

// Definisikan tipe untuk setiap link dari paginasi Laravel
interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

// Definisikan props untuk komponen Pagination
interface PaginationProps {
    links: PaginationLink[];
    className?: string;
}

export function Pagination({ links, className }: PaginationProps) {
    // Jangan render apapun jika tidak ada link paginasi
    if (links.length < 3) {
        return null;
    }

    return (
        <nav className={cn('flex items-center justify-center gap-2', className)}>
            {links.map((link, index) => {
                // Render tombol paginasi, baik itu 'Previous', 'Next', atau nomor halaman
                return (
                    <Button
                        key={index}
                        asChild
                        variant={link.active ? 'default' : 'outline'}
                        size="sm"
                        disabled={!link.url}
                        className={cn(!link.url && 'cursor-not-allowed opacity-50')}
                    >
                        <Link
                            href={link.url || ''}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    </Button>
                );
            })}
        </nav>
    );
}
