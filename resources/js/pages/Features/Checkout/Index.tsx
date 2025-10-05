import { Head, usePage, Link } from '@inertiajs/react';
import { PageProps as InertiaPageProps } from '@/types';
import Header from '@/pages/welcome/partials/Header';
import Footer from '@/pages/welcome/partials/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMemo } from 'react';

interface CartItem {
    product_id: number;
    name: string;
    quantity: number;
    price: number;
    options: any;
    image: string;
}

interface Cart {
    [id: string]: CartItem;
}

interface PageProps extends InertiaPageProps {
    // Jika ada data tambahan seperti provinsi, dll.
}

export default function CheckoutPage({ auth }: PageProps) {
    const { props } = usePage<PageProps>();
    const cart = props.cart as Cart;
    const cartItems = Object.entries(cart);

    const subtotal = useMemo(() => {
        return cartItems.reduce((acc, [, item]) => acc + item.price * item.quantity, 0);
    }, [cart]);

    const shippingCost = 15000; // Contoh biaya pengiriman
    const total = subtotal + shippingCost;

    return (
        <>
            <Head title="Checkout" />
            <div className="bg-gray-50 font-sans text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                <Header auth={auth} />
                <main className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 mb-8">
                        Checkout
                    </h1>
                    <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
                        {/* Kolom Kiri: Formulir */}
                        <div className="lg:col-span-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Alamat Pengiriman</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Nama Penerima</Label>
                                            <Input id="name" placeholder="John Doe" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Nomor Telepon</Label>
                                            <Input id="phone" placeholder="081234567890" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="address">Alamat Lengkap</Label>
                                        <Textarea id="address" placeholder="Jl. Pahlawan No. 123" />
                                    </div>
                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="province">Provinsi</Label>
                                            <Select><SelectTrigger><SelectValue placeholder="Pilih Provinsi" /></SelectTrigger><SelectContent>{/* Options */}</SelectContent></Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="city">Kota/Kabupaten</Label>
                                            <Select><SelectTrigger><SelectValue placeholder="Pilih Kota/Kabupaten" /></SelectTrigger><SelectContent>{/* Options */}</SelectContent></Select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="district">Kecamatan</Label>
                                            <Input id="district" placeholder="Kec. Sejahtera" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="zip">Kode Pos</Label>
                                            <Input id="zip" placeholder="12345" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Kolom Kanan: Ringkasan Pesanan */}
                        <div className="lg:col-span-1">
                            <Card className="sticky top-24">
                                <CardHeader>
                                    <CardTitle>Ringkasan Pesanan</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {cartItems.map(([id, item]) => (
                                        <div key={id} className="flex items-center gap-4">
                                            <img src={item.image} alt={item.name} className="h-16 w-16 rounded-md object-cover" />
                                            <div className="flex-1">
                                                <p className="font-semibold">{item.name}</p>
                                                <p className="text-sm text-gray-500">{item.quantity} x Rp {item.price.toLocaleString('id-ID')}</p>
                                            </div>
                                            <p className="font-medium">Rp {(item.quantity * item.price).toLocaleString('id-ID')}</p>
                                        </div>
                                    ))}
                                    <Separator />
                                    <div className="space-y-2">
                                        <div className="flex justify-between"><span>Subtotal</span><span>Rp {subtotal.toLocaleString('id-ID')}</span></div>
                                        <div className="flex justify-between"><span>Pengiriman</span><span>Rp {shippingCost.toLocaleString('id-ID')}</span></div>
                                        <Separator />
                                        <div className="flex justify-between font-bold text-lg"><span>Total</span><span>Rp {total.toLocaleString('id-ID')}</span></div>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button size="lg" className="w-full">Bayar Sekarang</Button>
                                </CardFooter>
                            </Card>
                        </div>
                    </div>
                </main>
                <Footer isInView={true} />
            </div>
        </>
    );
}
