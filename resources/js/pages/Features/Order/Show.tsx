import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { PageProps, BreadcrumbItem } from '@/types';
import { route } from 'ziggy-js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
    Package, Truck, CreditCard, User, MapPin,
    Download, FileIcon, ChevronLeft, Calendar,
    Mail, Phone, ExternalLink, Eye, Info
} from 'lucide-react';
import { Order, OrderStatus, PaymentStatus, OrderItem } from './types';

// NOTE: Using DUMMY DATA for initial design review as requested
const DUMMY_ORDER: Order = {
    id: 1024,
    user_id: 1,
    order_status: 'processing',
    payment_status: 'paid',
    payment_method: 'credit_card',
    shipping_method: 'jne',
    shipping_cost: 15000,
    total_price: 450000,
    tracking_number: null,
    estimated_completion_date: null,
    admin_notes: null,
    created_at: '2024-10-20T10:30:00.000000Z',
    updated_at: '2024-10-20T10:30:00.000000Z',
    shipping_address: {
        name: 'John Doe',
        phone: '081234567890',
        address: 'Jl. Sudirman No. 123, Jakarta Selatan',
        city: 'Jakarta',
        postal_code: '12190'
    },
    user: {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        email_verified_at: '2024-01-01T00:00:00.000000Z',
        role: 'customer',
        created_at: '2024-01-01T00:00:00.000000Z',
        updated_at: '2024-01-01T00:00:00.000000Z',
    },
    items: [
        {
            id: 1,
            order_id: 1024,
            product_id: 1,
            quantity: 2,
            price: 150000,
            created_at: '2024-10-20T10:30:00.000000Z',
            updated_at: '2024-10-20T10:30:00.000000Z',
            product: {
                id_produk: 1,
                nama_produk: 'Kaos Polos Premium',
                slug: 'kaos-polos-premium',
                harga: 150000,
                deskripsi: 'Kaos kualitas terbaik, bahan combed 30s sejuk dan nyaman dipakai.',
                stok: 100,
                category_id: 1,
                gambar: 'tshirt-black.jpg',
                gambar_url: '/storage/products/tshirt-black.jpg',
                status: true,
                allow_custom_design: true,
                enable_design_feature: true,
                created_at: '2024-01-01',
                updated_at: '2024-01-01',
            },
            options: {
                variant: {
                    Size: 'L',
                    Color: 'Black'
                },
                design: {
                    type: 'upload',
                    value: 'https://placehold.co/300x300/png?text=User+Upload+Logo',
                    original_filename: 'logo-perusahaan-final.png'
                }
            }
        },
        {
            id: 2,
            order_id: 1024,
            product_id: 2,
            quantity: 1,
            price: 135000,
            created_at: '2024-10-20T10:30:00.000000Z',
            updated_at: '2024-10-20T10:30:00.000000Z',
            product: {
                id_produk: 2,
                nama_produk: 'Topi Snapback Custom',
                slug: 'topi-snapback-custom',
                harga: 135000,
                deskripsi: 'Topi snapback dengan adjustable strap, cocok untuk gaya casual.',
                stok: 50,
                category_id: 2,
                gambar: 'cap.jpg',
                gambar_url: '/storage/products/cap.jpg',
                status: true,
                allow_custom_design: true,
                enable_design_feature: true,
                created_at: '2024-01-01',
                updated_at: '2024-01-01',
            },
            options: {
                variant: {
                    Color: 'Red'
                },
                design: null
            }
        },
        {
            id: 3,
            order_id: 1024,
            product_id: 3,
            quantity: 5,
            price: 200000,
            created_at: '2024-10-20T10:30:00.000000Z',
            updated_at: '2024-10-20T10:30:00.000000Z',
            product: {
                id_produk: 3,
                nama_produk: 'Hoodie Custom Store',
                slug: 'hoodie-custom-store',
                harga: 200000,
                deskripsi: 'Hoodie fleece tebal hangat dengan pilihan template desain eksklusif.',
                stok: 20,
                category_id: 3,
                gambar: 'hoodie-grey.jpg',
                gambar_url: '/storage/products/hoodie-grey.jpg',
                status: true,
                allow_custom_design: true,
                enable_design_feature: true,
                created_at: '2024-01-01',
                updated_at: '2024-01-01',
            },
            options: {
                variant: {
                    Size: 'XL',
                    Color: 'Grey'
                },
                design: {
                    type: 'template',
                    value: 'https://placehold.co/300x300/png?text=Store+Template+V1',
                    original_filename: 'Template Keren V1'
                }
            }
        }
    ]
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('dashboard') },
    { title: 'Orders', href: route('orders.index') },
    { title: 'Detail Order', href: '#' },
];

export default function Show({ order: realOrder }: PageProps<{ order: Order }>) {
    // USE DUMMY ORDER FOR UI DEVELOPMENT AS REQUESTED
    const order = DUMMY_ORDER;
    // const order = realOrder; // Uncomment this for real data later

    const [selectedItem, setSelectedItem] = useState<OrderItem | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    const handleOpenDetail = (item: OrderItem) => {
        setSelectedItem(item);
        setIsDetailOpen(true);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Order #${order.id}`} />

            <div className="p-4 sm:p-6 lg:p-8 space-y-6">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8 -ml-2" asChild>
                                <Link href={route('orders.index')}>
                                    <ChevronLeft className="h-4 w-4" />
                                </Link>
                            </Button>
                            <h1 className="text-2xl font-bold tracking-tight">Pesanan #{order.id}</h1>
                        </div>
                        <p className="text-muted-foreground flex items-center gap-2 text-sm ml-6">
                            <Calendar className="h-3.5 w-3.5" />
                            {formatDate(order.created_at)}
                        </p>
                    </div>
                    <div className="flex gap-2 ml-6 sm:ml-0">
                        <Badge variant="outline" className={`capitalize ${order.order_status === 'completed' ? 'bg-green-100 text-green-800' :
                            order.order_status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                'bg-blue-100 text-blue-800'
                            }`}>
                            Status: {order.order_status}
                        </Badge>
                        <Badge variant="outline" className={`capitalize ${order.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                            'bg-yellow-100 text-yellow-800'
                            }`}>
                            Pembayaran: {order.payment_status}
                        </Badge>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left Column - Product Details */}
                    <div className="md:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Package className="h-5 w-5" />
                                    Produk & Desain
                                </CardTitle>
                                <CardDescription>Daftar item yang dipesan dan file desain.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Produk</TableHead>
                                            <TableHead>Desain Preview</TableHead>
                                            <TableHead>Harga</TableHead>
                                            <TableHead>Jml</TableHead>
                                            <TableHead>Total</TableHead>
                                            <TableHead></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {order.items.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="w-[30%]">
                                                    <div className="font-medium">{item.product.nama_produk}</div>
                                                    {item.options?.variant && (
                                                        <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                                                            {Object.entries(item.options.variant).map(([key, value]) => (
                                                                <div key={key}><span className="opacity-70">{key}:</span> {value}</div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell className="w-[25%] px-0">
                                                    {item.options?.design ? (
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-12 w-12 rounded overflow-hidden bg-slate-50 border cursor-pointer hover:opacity-80 transition-opacity" onClick={() => handleOpenDetail(item)}>
                                                                <img
                                                                    src={item.options.design.value}
                                                                    alt="Thumb"
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <Badge variant="secondary" className="text-[10px] h-5 mb-1">
                                                                    {item.options.design.type === 'upload' ? 'Upload' : 'Template'}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground text-xs italic">-</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>{formatCurrency(item.price)}</TableCell>
                                                <TableCell>{item.quantity}</TableCell>
                                                <TableCell className="font-medium">
                                                    {formatCurrency(item.price * item.quantity)}
                                                </TableCell>
                                                <TableCell>
                                                    <Button variant="ghost" size="icon" onClick={() => handleOpenDetail(item)} title="Lihat Detail & Spesifikasi">
                                                        <Eye className="h-4 w-4 text-slate-500" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>

                        {/* Order Calculation - Keeping same as before */}
                        <Card>
                            <CardContent className="pt-6">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Subtotal Produk</span>
                                        <span>{formatCurrency(DUMMY_ORDER.items.reduce((acc, item) => acc + (item.price * item.quantity), 0))}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Biaya Pengiriman ({order.shipping_method.toUpperCase()})</span>
                                        <span>{formatCurrency(order.shipping_cost)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Pajak PPN (11%)</span>
                                        <span>{formatCurrency(DUMMY_ORDER.items.reduce((acc, item) => acc + (item.price * item.quantity), 0) * 0.11)}</span>
                                    </div>
                                    <Separator className="my-2" />
                                    <div className="flex justify-between font-bold text-lg">
                                        <span>Total Pembayaran</span>
                                        <span className="text-primary">{formatCurrency(order.total_price)}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Customer & Info - Keeping same as before */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <User className="h-4 w-4" />
                                    Informasi Pelanggan
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-sm">
                                <div className="flex items-start gap-3">
                                    <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                                        <User className="h-4 w-4 text-slate-500" />
                                    </div>
                                    <div>
                                        <div className="font-medium">{order.user.name}</div>
                                        <div className="text-muted-foreground text-xs">Customer ID: #{order.user.id}</div>
                                    </div>
                                </div>
                                <Separator />
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Mail className="h-3.5 w-3.5" />
                                        <span>{order.user.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Phone className="h-3.5 w-3.5" />
                                        <span>{order.shipping_address.phone}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Truck className="h-4 w-4" />
                                    Pengiriman
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-sm">
                                <div className="space-y-1">
                                    <div className="font-medium text-xs text-muted-foreground uppercase tracking-wider">Metode</div>
                                    <div className="font-medium capitalize">{order.shipping_method.replace('_', ' ')}</div>
                                </div>

                                <div className="space-y-1">
                                    <div className="font-medium text-xs text-muted-foreground uppercase tracking-wider">Alamat Penerima</div>
                                    <div className="flex gap-2">
                                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                        <div>
                                            <div className="font-medium">{order.shipping_address.name}</div>
                                            <div className="text-muted-foreground leading-relaxed">
                                                {order.shipping_address.address}<br />
                                                {order.shipping_address.city}, {order.shipping_address.postal_code}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* PRODUCT DETAIL POPUP */}
            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                <DialogContent className="max-w-6xl">
                    <DialogHeader>
                        <DialogTitle>Detail Spesifikasi Produk</DialogTitle>
                        <DialogDescription>
                            Informasi lengkap mengenai produk dan desain yang dipesan.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedItem && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                            {/* Product Info Column */}
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Informasi Produk</h3>
                                    <div className="flex gap-4">
                                        <div className="h-24 w-24 rounded-lg bg-white overflow-hidden border p-1">
                                            {/* Simulate Product Image */}
                                            <img
                                                src={selectedItem.product.gambar_url}
                                                alt={selectedItem.product.nama_produk}
                                                className="h-full w-full object-contain"
                                            />
                                        </div>
                                        <div>
                                            <div className="font-bold">{selectedItem.product.nama_produk}</div>
                                            <div className="text-sm text-slate-500 mt-1">{selectedItem.product.deskripsi}</div>
                                            <div className="mt-2 font-medium text-primary">{formatCurrency(selectedItem.price)} x {selectedItem.quantity}</div>
                                        </div>
                                    </div>
                                </div>

                                {selectedItem.options?.variant && (
                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Spesifikasi Varian</h3>
                                        <div className="bg-slate-50 rounded-lg p-3 border grid grid-cols-2 gap-2 text-sm">
                                            {Object.entries(selectedItem.options.variant).map(([key, value]) => (
                                                <div key={key} className="flex flex-col">
                                                    <span className="text-xs text-slate-400 uppercase">{key}</span>
                                                    <span className="font-medium">{value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Design Info Column */}
                            <div className="space-y-4 border-l pl-0 md:pl-6 border-dashed">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-medium text-muted-foreground">Preview Desain</h3>
                                    {selectedItem.options?.design && (
                                        <Badge variant={selectedItem.options.design.type === 'upload' ? 'default' : 'secondary'}>
                                            {selectedItem.options.design.type === 'upload' ? 'Custom Upload' : 'Template Toko'}
                                        </Badge>
                                    )}
                                </div>

                                {selectedItem.options?.design ? (
                                    <div className="space-y-4">
                                        <div className="aspect-square w-full bg-slate-100 rounded-lg border-2 border-dashed border-slate-200 flex items-center justify-center relative overflow-hidden group">
                                            <img
                                                src={selectedItem.options.design.value}
                                                alt="Full Design Preview"
                                                className="max-h-full max-w-full object-contain"
                                            />
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button variant="secondary" size="sm" className="gap-2">
                                                    <Download className="h-4 w-4" /> Unduh Resolusi Penuh
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="bg-blue-50 text-blue-800 p-3 rounded-md text-sm flex gap-2 items-start">
                                            <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <div className="font-bold text-xs uppercase mb-0.5">File Name</div>
                                                <div className="font-mono break-all">{selectedItem.options.design.original_filename}</div>
                                            </div>
                                        </div>

                                        {/* If it's a store template, we could show extra info here */}
                                        {selectedItem.options.design.type === 'template' && (
                                            <p className="text-xs text-muted-foreground text-center">
                                                User memilih template desain yang disediakan oleh toko.
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <div className="h-48 flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-lg border border-dashed">
                                        <FileIcon className="h-8 w-8 mb-2 opacity-50" />
                                        <p className="text-sm">Tidak ada desain custom</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
