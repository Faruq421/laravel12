// stubs/feature/react/FormPage.tsx.stub

import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { PageProps, BreadcrumbItem } from '@/types';
import { route } from 'ziggy-js';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

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
        name: item?.name ?? '',
        description: item?.description ?? '',
        price: item?.price ?? 0,
        stock: item?.stock ?? '',
        is_published: item?.is_published ?? '',
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

            <div className="p-4 sm:p-6 lg:p-8">
                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>{item ? 'Edit' : 'Create'} Product</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* SYNC_FORM_FIELDS_START */}
            <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" type="text" value={data.name} onChange={e => setData('name', e.target.value)} step="any" />
                {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
            </div>
                <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" value={data.description} onChange={e => setData('description', e.target.value)} />
                    {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
                </div>
            <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input id="price" type="number" value={data.price} onChange={e => setData('price', e.target.value)} step="any" />
                {errors.price && <p className="text-sm text-red-500 mt-1">{errors.price}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="stock">Stock</Label>
                <Input id="stock" type="text" value={data.stock} onChange={e => setData('stock', e.target.value)} step="any" />
                {errors.stock && <p className="text-sm text-red-500 mt-1">{errors.stock}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="is_published">Is Published</Label>
                <Input id="is_published" type="text" value={data.is_published} onChange={e => setData('is_published', e.target.value)} step="any" />
                {errors.is_published && <p className="text-sm text-red-500 mt-1">{errors.is_published}</p>}
            </div>
{/* SYNC_FORM_FIELDS_END */}
                        </CardContent>
                        <CardFooter className="flex justify-end gap-2">
                            <Link href={route('products.index')} className={cn(buttonVariants({ variant: 'ghost' }))}>Cancel</Link>
                            <Button type="submit" disabled={processing}>{item ? 'Update' : 'Create'}</Button>
                        </CardFooter>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
}
