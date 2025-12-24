import { Link } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Product {
    slug: string;
    gambar_url: string;
    nama_produk: string;
    category: {
        name: string;
    };
    harga: number;
}

interface ProductCardProps {
    product: Product;
    className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
    return (
        <Link href={`/products/${product.slug}`} className={cn("group block h-full", className)}>
            <Card className="h-full flex flex-col overflow-hidden transition-all duration-300 group-hover:shadow-xl">
                <CardContent className="p-0 flex flex-col flex-1">
                    <div className="aspect-square overflow-hidden shrink-0">
                        <img
                            src={product.gambar_url}
                            alt={product.nama_produk}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                        <p className="text-sm font-medium text-gray-500">{product.category.name}</p>
                        <h3 className="mt-1 font-bold text-lg text-gray-800 dark:text-gray-200 group-hover:text-orange-500 line-clamp-2">
                            {product.nama_produk}
                        </h3>
                        <div className="mt-auto pt-4">
                            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                Rp {product.harga.toLocaleString('id-ID')}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
