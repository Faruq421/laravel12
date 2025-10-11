import { AuthenticatedLayout } from '@/layouts/authenticated-layout';
import { PageProps, Paginated } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Order, OrderItem } from './types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Pagination } from '@/components/pagination';

interface OrderIndexProps extends PageProps {
    orders: Paginated<Order>;
}

export default function OrderIndex({ auth, orders }: OrderIndexProps) {
    const formatDate = (dateString: string) => {
        return format(new Date(dateString), "d MMMM yyyy, HH:mm", { locale: id });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
    };

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'pending': return 'secondary';
            case 'processing': return 'default';
            case 'shipped': return 'outline';
            case 'completed': return 'success';
            case 'cancelled': return 'destructive';
            default: return 'secondary';
        }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Riwayat Pesanan" />

            <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Riwayat Pesanan Anda</CardTitle>
                        <CardDescription>Lihat semua transaksi yang pernah Anda buat.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {orders.data.length > 0 ? (
                            <Accordion type="single" collapsible className="w-full">
                                {orders.data.map((order) => (
                                    <AccordionItem value={order.id.toString()} key={order.id}>
                                        <AccordionTrigger>
                                            <div className="flex flex-col md:flex-row md:items-center justify-between w-full pr-4 text-left">
                                                <div className="flex-1 mb-2 md:mb-0">
                                                    <p className="font-bold text-lg text-gray-800">{order.order_number}</p>
                                                    <p className="text-sm text-gray-500">{formatDate(order.created_at)}</p>
                                                </div>
                                                <div className="flex-1 flex items-center justify-start md:justify-center mb-2 md:mb-0">
                                                    <Badge variant={getStatusVariant(order.order_status)} className="capitalize">{order.order_status}</Badge>
                                                </div>
                                                <div className="flex-1 font-semibold text-gray-900 text-left md:text-right">
                                                    {formatCurrency(order.total_amount)}
                                                </div>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <div className="p-4 bg-gray-50 rounded-lg">
                                                <h4 className="font-semibold mb-4">Detail Item</h4>
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead className="w-[80px]">Produk</TableHead>
                                                            <TableHead>Nama</TableHead>
                                                            <TableHead className="text-center">Kuantitas</TableHead>
                                                            <TableHead className="text-right">Harga</TableHead>
                                                            <TableHead className="text-right">Subtotal</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {order.items.map((item: OrderItem) => (
                                                            <TableRow key={item.id}>
                                                                <TableCell>
                                                                    <img src={item.product.gambar_url} alt={item.product.nama_produk} className="w-16 h-16 object-cover rounded-md" />
                                                                </TableCell>
                                                                <TableCell className="font-medium">{item.product.nama_produk}</TableCell>
                                                                <TableCell className="text-center">{item.quantity}</TableCell>
                                                                <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                                                                <TableCell className="text-right">{formatCurrency(item.price * item.quantity)}</TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                                <div className="mt-6">
                                                    <h4 className="font-semibold mb-2">Alamat Pengiriman</h4>
                                                    <div className="text-sm text-gray-600">
                                                        <p className="font-medium">{order.shipping_address.name}</p>
                                                        <p>{order.shipping_address.phone}</p>
                                                        <p>{order.shipping_address.address}, {order.shipping_address.city}, {order.shipping_address.postal_code}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        ) : (
                            <div className="text-center py-12">
                                <h3 className="text-xl font-semibold">Anda Belum Punya Pesanan</h3>
                                <p className="text-gray-500 mt-2 mb-6">Sepertinya Anda belum pernah berbelanja. Mari kita cari sesuatu!</p>
                                <Button asChild>
                                    <Link href={route('welcome')}>Mulai Belanja</Link>
                                </Button>
                            </div>
                        )}

                        <div className="mt-8">
                            <Pagination links={orders.links} />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}