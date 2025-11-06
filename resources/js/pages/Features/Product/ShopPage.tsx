import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import SiteLayout from '@/Layouts/SiteLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from '@/components/ui/drawer';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
} from '@/components/ui/pagination';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import {
    ToggleGroup,
    ToggleGroupItem,
} from '@/components/ui/toggle-group';
import { ImageWithFallback } from '@/components/ImageWithFallback';
import { formatRupiah } from '@/lib/utils';
import { List, LayoutGrid, Filter } from 'lucide-react';

// Komponen Filter dipisahkan agar lebih rapi
const FilterContent = ({ localFilters, setLocalFilters, applyFilters, resetFilters, categories }) => (
    <div className="p-4 space-y-6">
        <div>
            <h3 className="font-semibold mb-2">Kategori</h3>
            <div className="space-y-2">
                <Button
                    variant={localFilters.category === '' ? 'secondary' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setLocalFilters(prev => ({ ...prev, category: '' }))}
                >
                    Semua Kategori
                </Button>
                {categories.map((category, index) => (
                    <Button
                        key={index}
                        variant={localFilters.category === category ? 'secondary' : 'ghost'}
                        className="w-full justify-start"
                        onClick={() => setLocalFilters(prev => ({ ...prev, category: category }))}
                    >
                        {category}
                    </Button>
                ))}
            </div>
        </div>
        <div>
            <h3 className="font-semibold mb-2">Rentang Harga</h3>
            <Slider
                value={localFilters.priceRange}
                onValueChange={(val) => setLocalFilters(prev => ({ ...prev, priceRange: val }))}
                max={1000000}
                step={50000}
            />
            <div className="flex justify-between text-sm mt-2">
                <span>{formatRupiah(localFilters.priceRange[0])}</span>
                <span>{formatRupiah(localFilters.priceRange[1])}</span>
            </div>
        </div>
        <div className="flex gap-2">
            <Button onClick={applyFilters} className="flex-1">Terapkan Filter</Button>
            <Button onClick={resetFilters} variant="outline" className="flex-1">Reset</Button>
        </div>
    </div>
);

export default function ShopPage() {
    const { products: paginatedProducts, filters, categories } = usePage().props as any;

    const [localFilters, setLocalFilters] = useState({
        category: filters.category || '',
        priceRange: [filters.min_price || 0, filters.max_price || 1000000],
        sort: filters.sort || 'newest',
    });

    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [drawerOpen, setDrawerOpen] = useState(false);

    const resetFilters = () => {
        router.get(route('shop.index'), {}, {
            preserveState: true,
            onSuccess: () => setDrawerOpen(false),
        });
    };

    const applyFilters = () => {
        router.get(route('shop.index'), {
            category: localFilters.category,
            min_price: localFilters.priceRange[0],
            max_price: localFilters.priceRange[1],
            sort: localFilters.sort,
        }, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => setDrawerOpen(false),
        });
    };

    const handleSortChange = (value) => {
        setLocalFilters(prev => ({ ...prev, sort: value }));
        router.get(route('shop.index'), {
            ...filters,
            sort: value,
        }, { preserveState: true, preserveScroll: true });
    };

    const displayedProducts = paginatedProducts.data;

    return (
        <SiteLayout>
            <Head title="Produk & Jasa" />
            <div className="container mx-auto px-4 py-8">
                <header className="mb-8">
                    <h1 className="text-4xl font-bold tracking-tight">Produk & Jasa Kami</h1>
                    <p className="text-muted-foreground mt-2">
                        Temukan solusi cetak terbaik untuk semua kebutuhan Anda.
                    </p>
                </header>

                <div className="flex gap-8">
                    {/* Filter Sidebar for Desktop */}
                    <aside className="hidden lg:block w-1/4">
                        <h2 className="text-lg font-semibold mb-4">Filter</h2>
                        <FilterContent
                            localFilters={localFilters}
                            setLocalFilters={setLocalFilters}
                            applyFilters={applyFilters}
                            resetFilters={resetFilters}
                            categories={categories}
                        />
                    </aside>

                    <main className="flex-1">
                        {/* Header for Sorting and View Toggle */}
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-2">
                                <Select onValueChange={handleSortChange} value={localFilters.sort}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Urutkan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="newest">Terbaru</SelectItem>
                                        <SelectItem value="price-low">Harga: Rendah ke Tinggi</SelectItem>
                                        <SelectItem value="price-high">Harga: Tinggi ke Rendah</SelectItem>
                                    </SelectContent>
                                </Select>
                                <span className="text-sm text-muted-foreground hidden sm:inline">
                                    {paginatedProducts?.meta?.total || 0} produk ditemukan
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <ToggleGroup
                                    type="single"
                                    value={viewMode}
                                    onValueChange={(value: 'grid' | 'list') => value && setViewMode(value)}
                                >
                                    <ToggleGroupItem value="grid" aria-label="Grid view">
                                        <LayoutGrid className="h-4 w-4" />
                                    </ToggleGroupItem>
                                    <ToggleGroupItem value="list" aria-label="List view">
                                        <List className="h-4 w-4" />
                                    </ToggleGroupItem>
                                </ToggleGroup>
                                <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
                                    <DrawerTrigger asChild className="lg:hidden">
                                        <Button variant="outline" size="icon">
                                            <Filter className="h-4 w-4" />
                                        </Button>
                                    </DrawerTrigger>
                                    <DrawerContent>
                                        <DrawerHeader>
                                            <DrawerTitle>Filter</DrawerTitle>
                                        </DrawerHeader>
                                        <FilterContent
                                            localFilters={localFilters}
                                            setLocalFilters={setLocalFilters}
                                            applyFilters={applyFilters}
                                            resetFilters={resetFilters}
                                            categories={categories}
                                        />
                                    </DrawerContent>
                                </Drawer>
                            </div>
                        </div>

                        {/* Products Grid/List */}
                        <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
                            {displayedProducts.map((product) => (
                                <Card key={product.id_produk} className="overflow-hidden">
                                    <CardContent className="p-0">
                                        <Link href={route('products.show', product.slug)}>
                                            <ImageWithFallback
                                                src={`/storage/${product.gambar}`}
                                                alt={product.nama_produk}
                                                className="w-full h-48 object-cover"
                                            />
                                        </Link>
                                        <div className="p-4">
                                            <p className="text-sm text-muted-foreground">{product.category.name}</p>
                                            <h3 className="font-semibold truncate mt-1">
                                                <Link href={route('products.show', product.slug)}>{product.nama_produk}</Link>
                                            </h3>
                                            <p className="text-lg font-bold mt-2">{formatRupiah(product.harga)}</p>
                                            <Button className="w-full mt-4" asChild>
                                                <Link href={route('products.show', product.slug)}>Lihat Detail</Link>
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Pagination */}
                        <div className="mt-8">
                            {paginatedProducts?.meta?.last_page > 1 && (
                                <Pagination>
                                    <PaginationContent>
                                        {paginatedProducts.meta.links.map((link: any, index: number) => (
                                            <PaginationItem key={index}>
                                                <PaginationLink
                                                    href={link.url}
                                                    isActive={link.active}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                    className={!link.url ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                                />
                                            </PaginationItem>
                                        ))}
                                    </PaginationContent>
                                </Pagination>
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </SiteLayout>
    );
}
