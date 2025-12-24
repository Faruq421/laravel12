import React, { useState, useEffect, useCallback } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { PageProps, Pagination, BreadcrumbItem } from '@/types';
import { route } from 'ziggy-js';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Pencil, PlusCircle, Search, ArrowUpDown, Trash2 } from 'lucide-react';
import debounce from 'lodash.debounce';

interface Customer {
    id: number;
    // SYNC_ITEM_TYPE_START
    user_id: string;
    phone_number: string;
    address: string;
    city: string;
    province: string;
    // SYNC_ITEM_TYPE_END
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Customers',
        href: route('customers.index'),
    },
];

export default function Index({ auth, items, filters }: PageProps<{ items: Pagination<Customer>, filters: any }>) {
    const [search, setSearch] = useState(filters.search || '');
    const [sortBy, setSortBy] = useState(filters.sort_by || 'created_at');
    const [sortDir, setSortDir] = useState(filters.sort_dir || 'desc');

    const debouncedSearch = useCallback(
        debounce((value) => {
            router.get(route('customers.index'), { search: value, sort_by: sortBy, sort_dir: sortDir }, { preserveState: true, replace: true });
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
        router.get(route('customers.index'), { search, sort_by: newSortBy, sort_dir: newSortDir }, { preserveState: true, replace: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Customers" />
            <div className="p-4 sm:p-6 lg:p-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Customers</CardTitle>
                        <CardDescription>Kelola semua customers Anda di sini.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between gap-2 py-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Cari di semua kolom..."
                                    className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <Button asChild>
                                <Link href={route('customers.create')}>
                                    <PlusCircle className="mr-2 h-4 w-4" /> Tambah
                                </Link>
                            </Button>
                        </div>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        {/* SYNC_TABLE_HEADERS_START */}
<TableHead className="w-[40px]"><Checkbox /></TableHead>
<TableHead>User Id</TableHead>
<TableHead>Phone Number</TableHead>
<TableHead>Address</TableHead>
<TableHead>City</TableHead>
<TableHead>Province</TableHead>
<TableHead className="text-right">Action</TableHead>
{/* SYNC_TABLE_HEADERS_END */}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {items.data.map((item: Customer) => (
                                        <TableRow key={item.id}>
                                            {/* SYNC_TABLE_ROWS_START */}
<TableCell><Checkbox /></TableCell>
<TableCell className="font-medium">{ item.user_id }</TableCell>
<TableCell className="font-medium">{ item.phone_number }</TableCell>
<TableCell>{ item.address ? (item.address.substring(0, 50) + (item.address.length > 50 ? '...' : '')) : '' }</TableCell>
<TableCell className="font-medium">{ item.city }</TableCell>
<TableCell className="font-medium">{ item.province }</TableCell>
<TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button aria-haspopup="true" size="icon" variant="ghost">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                            <span className="sr-only">Toggle menu</span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuItem asChild>
                                                            <Link href={route('customers.edit', item.id)}>
                                                                <Pencil className="mr-2 h-4 w-4"/>
                                                                <span>Edit</span>
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="text-red-600" asChild>
                                                            <Link href={route('customers.destroy', item.id)} method="delete" as="button">
                                                                <Trash2 className="mr-2 h-4 w-4"/>
                                                                <span>Delete</span>
                                                            </Link>
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
{/* SYNC_TABLE_ROWS_END */}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
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
