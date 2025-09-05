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

interface Customer {
    id: number;
    // SYNC_FORM_ITEM_TYPE_START
    user_id: string;
    phone_number: string;
    address: string;
    city: string;
    province: string;
    // SYNC_FORM_ITEM_TYPE_END
}

export default function FormPage({ auth, item }: PageProps<{ item?: Customer }>) {

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Customers',
            href: route('customers.index'),
        },
        {
            title: item ? 'Edit' : 'Create',
            href: item ? route('customers.edit', item.id) : route('customers.create'),
        },
    ];

    // SYNC_FORM_DATA_START
    const { data, setData, post, put, processing, errors } = useForm<{
    user_id: string;
    phone_number: string;
    address: string;
    city: string;
    province: string;
    }>({
        user_id: item?.user_id ?? '',
        phone_number: item?.phone_number ?? '',
        address: item?.address ?? '',
        city: item?.city ?? '',
        province: item?.province ?? '',
    });
    // SYNC_FORM_DATA_END

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (item) {
            put(route('customers.update', item.id));
        } else {
            post(route('customers.store'));
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={(item ? 'Edit' : 'Create') + ' Customer'} />

            <div className="p-4 sm:p-6 lg:p-8">
                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>{item ? 'Edit' : 'Create'} Customer</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* SYNC_FORM_FIELDS_START */}
            <div className="space-y-2">
                <Label htmlFor="user_id">User Id</Label>
                <Input id="user_id" type="text" value={data.user_id} onChange={e => setData('user_id', e.target.value)} step="any" />
                {errors.user_id && <p className="text-sm text-red-500 mt-1">{errors.user_id}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="phone_number">Phone Number</Label>
                <Input id="phone_number" type="text" value={data.phone_number} onChange={e => setData('phone_number', e.target.value)} step="any" />
                {errors.phone_number && <p className="text-sm text-red-500 mt-1">{errors.phone_number}</p>}
            </div>
                <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea id="address" value={data.address} onChange={e => setData('address', e.target.value)} />
                    {errors.address && <p className="text-sm text-red-500 mt-1">{errors.address}</p>}
                </div>
            <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" type="text" value={data.city} onChange={e => setData('city', e.target.value)} step="any" />
                {errors.city && <p className="text-sm text-red-500 mt-1">{errors.city}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="province">Province</Label>
                <Input id="province" type="text" value={data.province} onChange={e => setData('province', e.target.value)} step="any" />
                {errors.province && <p className="text-sm text-red-500 mt-1">{errors.province}</p>}
            </div>
{/* SYNC_FORM_FIELDS_END */}
                        </CardContent>
                        <CardFooter className="flex justify-end gap-2">
                            <Link href={route('customers.index')} className={cn(buttonVariants({ variant: 'ghost' }))}>Cancel</Link>
                            <Button type="submit" disabled={processing}>{item ? 'Update' : 'Create'}</Button>
                        </CardFooter>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
}
