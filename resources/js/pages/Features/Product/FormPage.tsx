import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { PageProps, BreadcrumbItem } from '@/types';
import { route } from 'ziggy-js';

// Definisikan tipe data untuk item
interface Product {
    id: number;
    // SYNC_FORM_ITEM_TYPE_START
    name: string;
    description: string;
    price: number;
    stock: string;
    is_published: string;
    // SYNC_FORM_ITEM_TYPE_END
}

export default function FormPage({ auth, item }: PageProps<{ item?: Product }>) {

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Products',
            href: route('products.index'),
        },
        {
            title: item ? 'Edit' : 'Create',
            href: item ? route('products.edit', item.id) : route('products.create'),
        },
    ];

    // SYNC_FORM_DATA_START
    const { data, setData, post, put, processing, errors } = useForm<{
    name: string;
    description: string;
    price: number;
    stock: string;
    is_published: string;
    }>({
        name: item?.name || '',
        description: item?.description || '',
        price: item?.price 0,
        stock: item?.stock || '',
        is_published: item?.is_published || '',
    });
    // SYNC_FORM_DATA_END

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (item) {
            put(route('products.update', item.id));
        } else {
            post(route('products.store'));
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={(item ? 'Edit' : 'Create') + ' Product'} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                    <div className="p-6 bg-white border-b border-gray-200">
                        <h3 className="text-xl font-semibold mb-6">{item ? 'Edit' : 'Create'} Product</h3>
                        <form onSubmit={handleSubmit}>
                            {/* SYNC_FORM_FIELDS_START */}
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">Name</label>
                <input id="name" type="text" value={data.name} onChange={e => setData('name', e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" step="any" />
                {errors.name && <div className="text-red-500 text-xs mt-1">{errors.name}</div>}
            </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">Description</label>
                    <textarea id="description" value={data.description} onChange={e => setData('description', e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"></textarea>
                    {errors.description && <div className="text-red-500 text-xs mt-1">{errors.description}</div>}
                </div>
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="price">Price</label>
                <input id="price" type="number" value={data.price} onChange={e => setData('price', e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" step="any" />
                {errors.price && <div className="text-red-500 text-xs mt-1">{errors.price}</div>}
            </div>
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="stock">Stock</label>
                <input id="stock" type="text" value={data.stock} onChange={e => setData('stock', e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" step="any" />
                {errors.stock && <div className="text-red-500 text-xs mt-1">{errors.stock}</div>}
            </div>
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="is_published">Is Published</label>
                <input id="is_published" type="text" value={data.is_published} onChange={e => setData('is_published', e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" step="any" />
                {errors.is_published && <div className="text-red-500 text-xs mt-1">{errors.is_published}</div>}
            </div>
{/* SYNC_FORM_FIELDS_END */}

                            <div className="flex items-center justify-end mt-8">
                                <Link href={route('products.index')} className="text-gray-600 mr-4">Cancel</Link>
                                <button type="submit" disabled={processing} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                                    {item ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
