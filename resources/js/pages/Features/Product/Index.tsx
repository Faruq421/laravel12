import React, { useState, useEffect, useCallback } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { PageProps, Pagination, BreadcrumbItem } from '@/types';
import { route } from 'ziggy-js';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Pencil, PlusCircle, Search, ArrowUpDown, Trash2 } from 'lucide-react';
import debounce from 'lodash.debounce';

// --- Tipe Data & Helper Functions ---

interface Category {
    id: number;
    name: string;
}

interface Product {
    id_produk: number;
    nama_produk: string;
    deskripsi: string;
    harga: number;
    stok: number;
    gambar: string;
    category: Category | null;
    status: boolean;
}

const formatCurrency = (amount: number): string => {
    if (typeof amount !== 'number') return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount);
};

// --- Konstanta ---

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Products',
        href: route('products.index'),
    },
];

// --- Sub-Komponen Tabel Produk ---

interface ProductTableProps {
    items: Product[];
    onSort: (column: string) => void;
}

function ProductTable({ items, onSort }: ProductTableProps) {
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">Gambar</TableHead>
                        <TableHead>Nama Produk</TableHead>
                        <TableHead>Kategori</TableHead>
                        <TableHead>
                            <Button variant="ghost" onClick={() => onSort('harga')}>
                                Harga <ArrowUpDown className="ml-2 h-4 w-4" />
                            </Button>
                        </TableHead>
                        <TableHead className='text-center'>
                            <Button variant="ghost" onClick={() => onSort('stok')}>
                                Stok <ArrowUpDown className="ml-2 h-4 w-4" />
                            </Button>
                        </TableHead>
                        <TableHead className='text-center'>Status</TableHead>
                        {/* DIUBAH: Menggunakan text-center untuk memposisikan header Aksi di tengah */}
                        <TableHead className="text-center">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {items && items.length > 0 ? (
                        items.map((item) => (
                            <TableRow key={item.id_produk}>
                                <TableCell>
                                    <img
                                        src={`/storage/${item.gambar}`}
                                        alt={item.nama_produk}
                                        className="h-16 w-16 rounded-md object-cover"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.onerror = null;
                                            target.src = 'https://placehold.co/64x64/EFEFEF/AAAAAA?text=N/A';
                                        }}
                                    />
                                </TableCell>
                                <TableCell className="font-medium">{item.nama_produk}</TableCell>
                                <TableCell>{item.category?.name || 'N/A'}</TableCell>
                                <TableCell>{formatCurrency(item.harga)}</TableCell>
                                <TableCell className='text-center'>{item.stok}</TableCell>
                                <TableCell className='text-center'>
                                    <Badge variant={item.status ? 'default' : 'destructive'}>
                                        {item.status ? 'Published' : 'Draft'}
                                    </Badge>
                                </TableCell>
                                {/* DIUBAH: Menggunakan text-center untuk memposisikan konten Aksi di tengah */}
                                <TableCell className="text-center">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button aria-haspopup="true" size="icon" variant="ghost">
                                                <MoreHorizontal className="h-4 w-4" />
                                                <span className="sr-only">Toggle menu</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                                            <DropdownMenuItem asChild>
                                                <Link href={route('products.edit', item.id_produk)}>
                                                    <Pencil className="mr-2 h-4 w-4" />
                                                    <span>Edit</span>
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="text-red-600" asChild>
                                                <Link href={route('products.destroy', item.id_produk)} method="delete" as="button">
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    <span>Hapus</span>
                                                </Link>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={7} className="h-24 text-center">
                                Tidak ada data produk.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}

// --- Komponen Utama ---
export default function Index({ auth, items, filters }: PageProps<{ items: Pagination<Product>, filters: any }>) {
    const [search, setSearch] = useState(filters.search || '');
    const [sortBy, setSortBy] = useState(filters.sort_by || 'id_produk');
    const [sortDir, setSortDir] = useState(filters.sort_dir || 'desc');

    const debouncedSearch = useCallback(
        debounce((value: string) => {
            const params = { search: value, sort_by: sortBy, sort_dir: sortDir };
            router.get(route('products.index'), params, { preserveState: true, replace: true });
        }, 300),
        [sortBy, sortDir]
    );

    useEffect(() => {
        debouncedSearch(search);
        return () => debouncedSearch.cancel();
    }, [search, debouncedSearch]);

    const handleSort = (newSortBy: string) => {
        const newSortDir = sortBy === newSortBy && sortDir === 'asc' ? 'desc' : 'asc';
        setSortBy(newSortBy);
        setSortDir(newSortDir);
        const params = { search, sort_by: newSortBy, sort_dir: newSortDir };
        router.get(route('products.index'), params, { preserveState: true, replace: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Products" />
            <div className="p-4 sm:p-6 lg:p-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Produk</CardTitle>
                        <CardDescription>Kelola semua produk Anda di sini.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between gap-2 py-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Cari produk atau kategori..."
                                    className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <Button asChild>
                                <Link href={route('products.create')}>
                                    <PlusCircle className="mr-2 h-4 w-4" /> Tambah Produk
                                </Link>
                            </Button>
                        </div>

                        <ProductTable items={items.data} onSort={handleSort} />

                        <div className="flex items-center justify-between space-x-2 py-4">
                            <div className="text-sm text-muted-foreground">
                                Menampilkan {items.from}-{items.to} dari {items.total} data
                            </div>
                            <div className="space-x-2">
                                <Button variant="outline" size="sm" asChild disabled={!items.prev_page_url}><Link href={items.prev_page_url ?? '#'}>Sebelumnya</Link></Button>
                                <Button variant="outline" size="sm" asChild disabled={!items.next_page_url}><Link href={items.next_page_url ?? '#'}>Berikutnya</Link></Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
