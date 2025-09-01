import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { PageProps, Pagination, BreadcrumbItem } from '@/types';
import { route } from 'ziggy-js';

// Definisikan tipe data untuk item
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

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                    <div className="p-6 bg-white border-b border-gray-200">
                        <div className="flex items-center justify-between mb-6">
                            <Link
                                className="px-6 py-2 text-white bg-green-500 rounded-md focus:outline-none"
                                href={route('products.create')}
                            >
                                Create Product
                            </Link>
                        </div>
                        <table className="table-fixed w-full">
                            <thead>
                                <tr className="bg-gray-100">
                                    {/* SYNC_TABLE_HEADERS_START */}
<th className="px-4 py-2 w-20">ID</th>
<th className="px-4 py-2">Name</th>
<th className="px-4 py-2">Description</th>
<th className="px-4 py-2">Price</th>
<th className="px-4 py-2">Stock</th>
<th className="px-4 py-2">Is Published</th>
<th className="px-4 py-2">Action</th>
{/* SYNC_TABLE_HEADERS_END */}
                                </tr>
                            </thead>
                            <tbody>
                                {items.data.map((item) => (
                                    <tr key={item.id}>
                                        {/* SYNC_TABLE_ROWS_START */}
<td className="border px-4 py-2">{ item.id }</td>
<td className="border px-4 py-2">{ item.name }</td>
<td className="border px-4 py-2">{ item.description ? (item.description.substring(0, 50) + (item.description.length > 50 ? '...' : '')) : '' }</td>
<td className="border px-4 py-2 text-right">{ new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.price) }</td>
<td className="border px-4 py-2">{ item.stock }</td>
<td className="border px-4 py-2">{ item.is_published }</td>
<td className="border px-4 py-2">
                                            <Link
                                                tabIndex={1}
                                                className="px-4 py-2 text-sm text-white bg-blue-500 rounded"
                                                href={route('products.edit', item.id)}
                                            >
                                                Edit
                                            </Link>
                                        </td>
{/* SYNC_TABLE_ROWS_END */}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
