import React, { useState, useEffect, useCallback } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { PageProps, BreadcrumbItem } from '@/types';
import { route } from 'ziggy-js';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Pencil, Search, ArrowUpDown, Trash2, Star, Eye, EyeOff } from 'lucide-react';
import debounce from 'lodash.debounce';

interface Review {
    id: number;
    user_id: number;
    product_id: number;
    order_id: number;
    rating: number;
    comment: string | null;
    photos: string[] | null;
    is_visible: boolean;
    created_at: string;
    user?: { id: number; name: string; email: string };
    product?: { id_produk: number; nama_produk: string };
    order?: { id: number };
}

interface Pagination<T> {
    data: T[];
    from: number;
    to: number;
    total: number;
    current_page: number;
    last_page: number;
    prev_page_url: string | null;
    next_page_url: string | null;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('dashboard') },
    { title: 'Reviews', href: route('reviews.index') },
];

export default function Index({ items, filters }: PageProps<{ items: Pagination<Review>, filters: any }>) {
    const [search, setSearch] = useState(filters.search || '');
    const [sortBy, setSortBy] = useState(filters.sort_by || 'created_at');
    const [sortDir, setSortDir] = useState(filters.sort_dir || 'desc');

    const debouncedSearch = useCallback(
        debounce((value) => {
            router.get(route('reviews.index'), { search: value, sort_by: sortBy, sort_dir: sortDir }, { preserveState: true, replace: true });
        }, 300),
        [sortBy, sortDir]
    );

    useEffect(() => {
        debouncedSearch(search);
        return () => debouncedSearch.cancel();
    }, [search, debouncedSearch]);

    const handleSort = (newSortBy: string) => {
        let newSortDir = 'asc';
        if (sortBy === newSortBy && sortDir === 'asc') {
            newSortDir = 'desc';
        }
        setSortBy(newSortBy);
        setSortDir(newSortDir);
        router.get(route('reviews.index'), { search, sort_by: newSortBy, sort_dir: newSortDir }, { preserveState: true, replace: true });
    };

    const handleDelete = (review: Review) => {
        if (confirm(`Apakah Anda yakin ingin menghapus review ini?`)) {
            router.delete(route('reviews.destroy', review.id));
        }
    };

    const toggleVisibility = (review: Review) => {
        router.patch(route('reviews.update', review.id), {
            rating: review.rating,
            comment: review.comment,
            is_visible: !review.is_visible,
        }, { preserveState: true });
    };

    const renderStars = (rating: number) => {
        return (
            <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`h-4 w-4 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`}
                    />
                ))}
                <span className="ml-2 text-sm text-muted-foreground">({rating})</span>
            </div>
        );
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'short', year: 'numeric'
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kelola Reviews" />
            <div className="p-4 sm:p-6 lg:p-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Kelola Reviews</CardTitle>
                        <CardDescription>Lihat dan moderasi semua ulasan produk dari pelanggan.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between gap-2 py-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Cari berdasarkan nama user, produk, atau komentar..."
                                    className="w-full rounded-lg bg-background pl-8 md:w-[300px] lg:w-[400px]"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[50px]">ID</TableHead>
                                        <TableHead>
                                            <Button variant="ghost" className="h-8 p-0" onClick={() => handleSort('user_id')}>
                                                User <ArrowUpDown className="ml-2 h-4 w-4" />
                                            </Button>
                                        </TableHead>
                                        <TableHead>Produk</TableHead>
                                        <TableHead className="w-[80px]">Order</TableHead>
                                        <TableHead>
                                            <Button variant="ghost" className="h-8 p-0" onClick={() => handleSort('rating')}>
                                                Rating <ArrowUpDown className="ml-2 h-4 w-4" />
                                            </Button>
                                        </TableHead>
                                        <TableHead className="max-w-[200px]">Komentar</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>
                                            <Button variant="ghost" className="h-8 p-0" onClick={() => handleSort('created_at')}>
                                                Tanggal <ArrowUpDown className="ml-2 h-4 w-4" />
                                            </Button>
                                        </TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {items.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                                                Belum ada review dari pelanggan.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        items.data.map((review) => (
                                            <TableRow key={review.id}>
                                                <TableCell className="font-medium">#{review.id}</TableCell>
                                                <TableCell>
                                                    <div className="font-medium">{review.user?.name || 'Unknown'}</div>
                                                    <div className="text-xs text-muted-foreground">{review.user?.email || ''}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="font-medium">{review.product?.nama_produk || 'Unknown'}</span>
                                                </TableCell>
                                                <TableCell>
                                                    <Link href={route('orders.show', review.order_id)} className="text-primary hover:underline">
                                                        #{review.order_id}
                                                    </Link>
                                                </TableCell>
                                                <TableCell>{renderStars(review.rating)}</TableCell>
                                                <TableCell className="max-w-[200px]">
                                                    <p className="truncate text-sm text-muted-foreground" title={review.comment || ''}>
                                                        {review.comment || <span className="italic">Tidak ada komentar</span>}
                                                    </p>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={review.is_visible ? 'default' : 'secondary'}
                                                        className={`cursor-pointer ${review.is_visible ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                                        onClick={() => toggleVisibility(review)}
                                                    >
                                                        {review.is_visible ? (
                                                            <><Eye className="h-3 w-3 mr-1" /> Visible</>
                                                        ) : (
                                                            <><EyeOff className="h-3 w-3 mr-1" /> Hidden</>
                                                        )}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {formatDate(review.created_at)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                                <span className="sr-only">Open menu</span>
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem asChild>
                                                                <Link href={route('reviews.edit', review.id)} className="flex items-center">
                                                                    <Pencil className="mr-2 h-4 w-4" /> Edit
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                className="text-red-600 focus:text-red-600"
                                                                onClick={() => handleDelete(review)}
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" /> Hapus
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                        <div className="flex items-center justify-between space-x-2 py-4">
                            <div className="text-sm text-muted-foreground">
                                Menampilkan {items.from || 0}-{items.to || 0} dari {items.total} review
                            </div>
                            <div className="space-x-2">
                                <Button variant="outline" size="sm" asChild disabled={!items.prev_page_url}>
                                    <Link href={items.prev_page_url ?? '#'}>Sebelumnya</Link>
                                </Button>
                                <Button variant="outline" size="sm" asChild disabled={!items.next_page_url}>
                                    <Link href={items.next_page_url ?? '#'}>Berikutnya</Link>
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

