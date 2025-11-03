import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { type PageProps } from '@/types';
import { route } from 'ziggy-js';
import SiteLayout from '@/layouts/SiteLayout';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, CheckCircle, Truck, Hourglass } from 'lucide-react';

// Tentukan tipe data dasar untuk props
interface OrderItemProduct {
    name: string;
    // tambahkan field lain jika perlu, mis: 'image_url'
}

interface OrderItem {
    id: number;
    product: OrderItemProduct;
    quantity: number;
    price: number;
}

interface Order {
    id: number;
    invoice_number: string;
    created_at: string;
    status: string; // Mis: 'pending', 'processing', 'shipped', 'completed'
    total_price: number;
    estimated_delivery: string | null; // Tanggal estimasi
    items: OrderItem[];
}

// Tipe untuk data paginasi
interface PaginatedOrders {
    data: Order[];
    // tambahkan links, meta jika perlu untuk paginasi
}

// Helper untuk styling status
const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
        case 'completed':
            return <Badge variant="success"><CheckCircle className="mr-2 h-4 w-4" />Selesai</Badge>;
        case 'shipped':
            return <Badge variant="default" className="bg-blue-500 text-white"><Truck className="mr-2 h-4 w-4" />Dikirim</Badge>;
        case 'processing':
            return <Badge variant="secondary"><Hourglass className="mr-2 h-4 w-4" />Diproses</Badge>;
        default:
            return <Badge variant="outline"><Package className="mr-2 h-4 w-4" />Menunggu</Badge>;
    }
};

export default function MyOrdersPage() {
    // Ambil data 'orders' yang dikirim dari controller
    const { orders } = usePage<{ orders: PaginatedOrders }>().props;

    return (
        <SiteLayout>
            <Head title="Pesanan Saya" />
            <div className="container mx-auto px-6 py-12">
                <h1 className="text-3xl font-bold text-gray-800 mb-8">
                    Pesanan Saya
                </h1>

                {orders.data.length > 0 ? (
                    <div className="space-y-6">
                        {orders.data.map((order) => (
                            <Card key={order.id} className="overflow-hidden">
                                <CardHeader className="flex flex-row justify-between items-center bg-gray-50 border-b p-4">
                                    <div>
                                        <CardTitle className="text-lg">Pesanan #{order.invoice_number}</CardTitle>
                                        <p className="text-sm text-gray-500">
                                            Tanggal: {new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        {getStatusBadge(order.status)}
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4 md:p-6">
                                    <ul className="space-y-3 mb-4">
                                        {order.items.map(item => (
                                            <li key={item.id} className="flex justify-between items-center">
                                                <span className="text-gray-700">{item.product.name} (x{item.quantity})</span>
                                                <span className="font-medium">Rp {item.price.toLocaleString('id-ID')}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <div className="border-t pt-4 flex justify-between items-center">
                                        <span className="text-gray-600">Total Pesanan</span>
                                        <span className="text-xl font-bold text-gray-800">
                                            Rp {order.total_price.toLocaleString('id-ID')}
                                        </span>
                                    </div>

                                    {/* INI ADALAH FITUR ESTIMASI PENGGUNA */}
                                    {order.estimated_delivery && (
                                        <div className="mt-4 border-t pt-4">
                                            <h4 className="font-semibold text-gray-700">Estimasi Tiba:</h4>
                                            <p className="text-[#FF6500] font-medium">
                                                {new Date(order.estimated_delivery).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                                <CardFooter className="bg-gray-50 border-t p-4 flex justify-end space-x-2">
                                    {/* Tautkan ke halaman detail pesanan jika ada */}
                                    <Button asChild variant="outline">
                                        <Link href="#">Lihat Detail</Link>
                                    </Button>
                                    {order.status.toLowerCase() === 'shipped' && (
                                        <Button className="bg-[#FF6500] hover:bg-[#C40C0C]">
                                            Lacak Pengiriman
                                        </Button>
                                    )}
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 border rounded-lg">
                        <Package className="h-16 w-16 mx-auto text-gray-400" />
                        <h2 className="mt-4 text-xl font-semibold text-gray-700">Anda belum memiliki pesanan</h2>
                        <p className="mt-2 text-gray-500">Semua pesanan Anda akan muncul di sini.</p>
                        <Button asChild className="mt-6 bg-[#FF6500] hover:bg-[#C40C0C]">
                            <Link href="/">Mulai Belanja</Link>
                        </Button>
                    </div>
                )}

                {/* Tambahkan Navigasi Paginasi di sini jika diperlukan */}
            </div>
        </SiteLayout>
    );
}
