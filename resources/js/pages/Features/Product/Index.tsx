// stubs/feature/react/Index.tsx.stub

import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { PageProps, Pagination, BreadcrumbItem } from '@/types';
import { route } from 'ziggy-js';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Product {
    id: number;
    // SYNC_ITEM_TYPE_START
    name: string;
    description: string;
    price: number;
    stock: string;
    is_published: string;
    // SYNC_ITEM_TYPE_END
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Products',
        href: route('products.index'),
    },
];

export default function Index({ auth, items }: PageProps<{ items: Pagination<Product> }>) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Products" />
            <div className="p-4 sm:p-6 lg:p-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Products</CardTitle>
                        <Button asChild>
                            <Link href={route('products.create')}>Create Product</Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    {/* SYNC_TABLE_HEADERS_START */}
<TableHead className="w-[80px]">ID</TableHead>
<TableHead>Name</TableHead>
<TableHead>Description</TableHead>
<TableHead>Price</TableHead>
<TableHead>Stock</TableHead>
<TableHead>Is Published</TableHead>
<TableHead className="text-right">Action</TableHead>
{/* SYNC_TABLE_HEADERS_END */}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {items.data.map((item) => (
                                    <TableRow key={item.id}>
                                        {/* SYNC_TABLE_ROWS_START */}
<TableCell className="font-medium">{item.id}</TableCell>
<TableCell>{ item.name }</TableCell>
<TableCell>{ item.description ? (item.description.substring(0, 50) + (item.description.length > 50 ? '...' : '')) : '' }</TableCell>
<TableCell className="text-right">{ new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.price) }</TableCell>
<TableCell>{ item.stock }</TableCell>
<TableCell>{ item.is_published }</TableCell>
<TableCell className="text-right">
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={route('products.edit', item.id)}>Edit</Link>
                                            </Button>
                                        </TableCell>
{/* SYNC_TABLE_ROWS_END */}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
