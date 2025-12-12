import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import SiteLayout from '@/Layouts/SiteLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { ProductQuickView } from '@/components/ProductQuickView';
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
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import {
    ToggleGroup,
    ToggleGroupItem,
} from '@/components/ui/toggle-group';
import { ImageWithFallback } from '@/components/ImageWithFallback';
import { formatRupiah } from '@/lib/utils';
import { List, LayoutGrid, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Komponen Filter dipisahkan agar lebih rapi
const FilterContent = ({ localFilters, setLocalFilters, applyFilters, resetFilters, categories }) => (
    <div className="space-y-6">
        <Accordion type="multiple" defaultValue={['category', 'price']} className="w-full">
            <AccordionItem value="category" className="border-b-0">
                <AccordionTrigger className="hover:no-underline py-2">Kategori</AccordionTrigger>
                <AccordionContent>
                    <div className="space-y-1 pt-1">
                        <Button
                            variant={localFilters.category === '' ? 'secondary' : 'ghost'}
                            className="w-full justify-start h-8 font-normal"
                            onClick={() => setLocalFilters(prev => ({ ...prev, category: '' }))}
                        >
                            Semua Kategori
                        </Button>
                        {categories.map((category, index) => (
                            <Button
                                key={index}
                                variant={localFilters.category === category ? 'secondary' : 'ghost'}
                                className="w-full justify-start h-8 font-normal"
                                onClick={() => setLocalFilters(prev => ({ ...prev, category: category }))}
                            >
                                {category}
                            </Button>
                        ))}
                    </div>
                </AccordionContent>
            </AccordionItem>

            <AccordionItem value="price" className="border-b-0">
                <AccordionTrigger className="hover:no-underline py-2">Rentang Harga</AccordionTrigger>
                <AccordionContent>
                    <div className="pt-2 px-1">
                        <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                                <span className="absolute left-2.5 top-2.5 text-xs text-muted-foreground">Rp</span>
                                <Input
                                    type="number"
                                    placeholder="Min"
                                    className="pl-8 h-9 text-sm"
                                    value={localFilters.priceRange[0]}
                                    onChange={(e) => {
                                        const val = Number(e.target.value);
                                        setLocalFilters(prev => ({ ...prev, priceRange: [val, prev.priceRange[1]] }));
                                    }}
                                />
                            </div>
                            <span className="text-muted-foreground bg-transparent">-</span>
                            <div className="relative flex-1">
                                <span className="absolute left-2.5 top-2.5 text-xs text-muted-foreground">Rp</span>
                                <Input
                                    type="number"
                                    placeholder="Max"
                                    className="pl-8 h-9 text-sm"
                                    value={localFilters.priceRange[1]}
                                    onChange={(e) => {
                                        const val = Number(e.target.value);
                                        setLocalFilters(prev => ({ ...prev, priceRange: [prev.priceRange[0], val] }));
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>

        <div className="flex gap-2 pt-2 border-t">
            <Button onClick={applyFilters} className="flex-1">Terapkan</Button>
            <Button onClick={resetFilters} variant="outline" className="flex-1">Reset</Button>
        </div>
    </div>
);

export default function ShopPage() {
    const { products: paginatedProducts, filters, categories } = usePage().props as {
        products: {
            data: Array<{
                id_produk: number;
                slug: string;
                gambar: string;
                nama_produk: string;
                harga: number;
                category: { name: string };
            }>;
            meta: {
                last_page: number;
                links: Array<{ url: string; label: string; active: boolean }>;
                total: number;
            };
        };
        filters: { category: string; min_price: number; max_price: number; sort: string };
        categories: string[];
    };

    const [localFilters, setLocalFilters] = useState({
        category: filters.category || '',
        priceRange: [filters.min_price || 0, filters.max_price || 1000000],
        sort: filters.sort || 'newest',
    });

    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [drawerOpen, setDrawerOpen] = useState(false);

    const [isQuickViewOpen, setQuickViewOpen] = useState(false);
    const [selectedProductSlug, setSelectedProductSlug] = useState<string | null>(null);

    const handleOpenQuickView = (slug: string) => {
        setSelectedProductSlug(slug);
        setQuickViewOpen(true);
    };

    const handleCloseQuickView = () => {
        setQuickViewOpen(false);
        setSelectedProductSlug(null);
    };

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
                                <Card key={product.id_produk} className="overflow-hidden group transition-all duration-300 hover:shadow-xl">
                                    <CardContent className="p-0">
                                        {/* AKSI 1: Tautan "Lihat Detail" (membungkus gambar & info) */}
                                        <Link href={route('products.show', product.slug)}>
                                            <ImageWithFallback
                                                src={`/storage/${product.gambar}`}
                                                alt={product.nama_produk}
                                                className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                                            />
                                            <div className="p-4">
                                                <p className="text-sm text-muted-foreground">{product.category.name}</p>
                                                <h3 className="font-semibold truncate mt-1 text-foreground">
                                                    {product.nama_produk}
                                                </h3>
                                                <p className="text-lg font-bold text-primary mt-2">
                                                    {formatRupiah(product.harga)}
                                                </p>
                                            </div>
                                        </Link>
                                    </CardContent>

                                    {/* AKSI 2: Tombol "Tambah ke Keranjang" (muncul saat hover) */}
                                    {/* Ini berada di luar <CardContent> dan di luar <Link> */}
                                    {/* --- PERUBAHAN DI BAWAH --- */}
                                    <CardFooter
                                        className="p-4 pt-0 overflow-hidden max-h-0 opacity-0 group-hover:max-h-40 group-hover:opacity-500 transition-all duration-800 ease-in-out"
                                    >
                                        <Button
                                            className="w-full gap-2"
                                            variant="default"
                                            onClick={() => handleOpenQuickView(product.slug)}
                                        >
                                            Pesan Sekarang
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>

                        {/* Pagination */}
                        <div className="mt-8">
                            {paginatedProducts?.meta?.last_page > 1 && (
                                <Pagination>
                                    <PaginationContent>
                                        {paginatedProducts.meta.links.map((link: { url: string; label: string; active: boolean }, index: number) => (
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
            {selectedProductSlug && (
                <ProductQuickView
                    productSlug={selectedProductSlug}
                    isOpen={isQuickViewOpen}
                    onClose={handleCloseQuickView}
                />
            )}
        </SiteLayout>
    );
}
