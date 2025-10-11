import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { AuthenticatedLayout } from '@/layouts/authenticated-layout';
import { PageProps } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Stepper } from '@/components/ui/Stepper';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Truck, CreditCard, CheckCircle2, Terminal, Lock, Loader2, Banknote, Wallet } from 'lucide-react';

// Definisikan tipe data untuk item keranjang
interface CartItem {
    id: string;
    name: string;
    quantity: number;
    price: number;
    image: string;
    variant?: string[];
}

// Definisikan props untuk halaman Checkout
interface CheckoutPageProps extends PageProps {
    cartItems: CartItem[];
}

// Komponen Input Kustom untuk styling yang konsisten
const ModernInput = (props: React.ComponentProps<typeof Input>) => (
    <Input className="bg-slate-50 border-slate-300 focus-visible:ring-orange-500 rounded-lg px-4 py-3" {...props} />
);

// Komponen Ringkasan Pesanan yang dapat digunakan kembali
const OrderSummary = ({ cartItems, total, subtotal, shippingCost, processing, currentStep, handleNextStep, handlePrevStep, handleSubmit, steps }) => (
    <Card className="sticky top-24 shadow-lg border rounded-xl">
        <CardHeader className="bg-gray-50 rounded-t-xl">
            <CardTitle>Ringkasan Pesanan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
            <div className="max-h-64 overflow-y-auto space-y-4 pr-3">
                {cartItems.map(item => (
                    <div key={item.id} className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                            <img src={item.image} alt={item.name} className="w-16 h-16 rounded-md object-cover border" />
                            <div>
                                <p className="font-semibold text-gray-800">{item.name}</p>
                                {/* TODO: Tambahkan detail varian di sini jika tersedia */}
                                <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                            </div>
                        </div>
                        <p className="font-medium text-gray-900 text-right">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</p>
                    </div>
                ))}
            </div>
            <Separator />
            <div className="space-y-2">
                <div className="flex justify-between"><p className="text-gray-600">Subtotal</p><p className="font-medium text-gray-800">Rp {subtotal.toLocaleString('id-ID')}</p></div>
                <div className="flex justify-between"><p className="text-gray-600">Pengiriman</p><p className="font-medium text-gray-800">Rp {shippingCost.toLocaleString('id-ID')}</p></div>
            </div>
            <Separator />
            <div className="flex justify-between text-xl font-bold text-gray-900">
                <p>Total</p>
                <p>Rp {total.toLocaleString('id-ID')}</p>
            </div>
        </CardContent>
        <CardFooter className="p-4 flex flex-col gap-3">
            <div className="flex items-center justify-center text-xs text-gray-500 gap-2">
                <Lock size={12} />
                <span>Transaksi Aman & Terenkripsi</span>
            </div>
            <div className="w-full flex flex-col gap-3">
                {currentStep < steps.length - 1 && (
                    <Button type="button" onClick={handleNextStep} className="w-full bg-[#FF6500] hover:bg-[#FF6500]/90 text-lg h-12 rounded-full font-bold">
                        {currentStep === 0 ? 'Lanjutkan ke Pembayaran' : 'Tinjau Pesanan'}
                    </Button>
                )}
                {currentStep === steps.length - 1 && (
                    <Button type="submit" className="w-full bg-[#FF6500] hover:bg-[#FF6500]/90 text-lg h-12 rounded-full font-bold" size="lg" disabled={processing}>
                        {processing ? <Loader2 className="animate-spin" /> : 'Konfirmasi Pesanan'}
                    </Button>
                )}
                {currentStep > 0 ? (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handlePrevStep}
                        className="w-full h-12 rounded-full font-bold border-[#FF6500] text-[#FF6500] hover:bg-red-600 hover:text-white hover:border-red-600"
                    >
                        Kembali
                    </Button>
                ) : (
                    <Button
                        variant="outline"
                        asChild
                        className="w-full h-12 rounded-full font-bold border-[#FF6500] text-[#FF6500] hover:bg-red-600 hover:text-white hover:border-red-600"
                    >
                        <Link href={route('welcome')}>
                            Kembali ke Halaman Utama
                        </Link>
                    </Button>
                )}
            </div>
        </CardFooter>
    </Card>
);

export default function Checkout({ auth, cartItems }: CheckoutPageProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const steps = [
        { name: 'Alamat', icon: <Truck className="h-6 w-6" /> },
        { name: 'Pembayaran', icon: <CreditCard className="h-6 w-6" /> },
        { name: 'Konfirmasi', icon: <CheckCircle2 className="h-6 w-6" /> },
    ];

    const { data, setData, post, processing, errors } = useForm({
        shipping_address: {
            name: auth.user.name || '',
            address: '',
            city: '',
            postal_code: '',
            phone: '',
        },
        save_address: false,
        selected_items: cartItems.map(item => item.id),
    });

    const subtotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
    const shippingCost = 15000;
    const total = subtotal + shippingCost;

    const handleNextStep = () => {
        if (currentStep === 0) {
            const { name, address, city, postal_code, phone } = data.shipping_address;
            if (!name || !address || !city || !postal_code || !phone) {
                alert('Harap lengkapi semua kolom alamat pengiriman.');
                return;
            }
        }
        setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    };

    const handlePrevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 0));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('checkout.store'), {
            preserveScroll: true,
        });
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 0: // Alamat
                return (
                    <Card className="shadow-lg border rounded-xl">
                        <CardHeader>
                            <CardTitle>Alamat Pengiriman</CardTitle>
                            <CardDescription>Ke mana pesanan ini akan kami kirim?</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="name">Nama Lengkap</Label>
                                    <ModernInput id="name" type="text" placeholder="John Doe" value={data.shipping_address.name} onChange={e => setData('shipping_address', { ...data.shipping_address, name: e.target.value })} required />
                                    {errors['shipping_address.name'] && <p className="text-red-500 text-xs mt-1">{errors['shipping_address.name']}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="phone">Nomor Telepon</Label>
                                    <ModernInput id="phone" type="tel" placeholder="081234567890" value={data.shipping_address.phone} onChange={e => setData('shipping_address', { ...data.shipping_address, phone: e.target.value })} required />
                                    {errors['shipping_address.phone'] && <p className="text-red-500 text-xs mt-1">{errors['shipping_address.phone']}</p>}
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="address">Alamat Lengkap</Label>
                                <ModernInput id="address" type="text" placeholder="Jl. Merdeka No. 17, RT 01/RW 02" value={data.shipping_address.address} onChange={e => setData('shipping_address', { ...data.shipping_address, address: e.target.value })} required />
                                {errors['shipping_address.address'] && <p className="text-red-500 text-xs mt-1">{errors['shipping_address.address']}</p>}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="city">Kota</Label>
                                    <ModernInput id="city" type="text" placeholder="Jakarta Selatan" value={data.shipping_address.city} onChange={e => setData('shipping_address', { ...data.shipping_address, city: e.target.value })} required />
                                    {errors['shipping_address.city'] && <p className="text-red-500 text-xs mt-1">{errors['shipping_address.city']}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="postal_code">Kode Pos</Label>
                                    <ModernInput id="postal_code" type="text" placeholder="12345" value={data.shipping_address.postal_code} onChange={e => setData('shipping_address', { ...data.shipping_address, postal_code: e.target.value })} required />
                                    {errors['shipping_address.postal_code'] && <p className="text-red-500 text-xs mt-1">{errors['shipping_address.postal_code']}</p>}
                                </div>
                            </div>
                            <div className="flex items-center space-x-2 pt-2">
                                <Checkbox id="save_address" checked={data.save_address} onCheckedChange={(checked) => setData('save_address', !!checked)} />
                                <label htmlFor="save_address" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Simpan alamat ini untuk transaksi berikutnya
                                </label>
                            </div>
                        </CardContent>
                    </Card>
                );
            case 1: // Pembayaran
                return (
                    <Card className="shadow-lg border rounded-xl">
                        <CardHeader>
                            <CardTitle>Metode Pembayaran</CardTitle>
                            <CardDescription>Pilih cara Anda untuk membayar.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <Alert>
                                <Terminal className="h-4 w-4" />
                                <AlertTitle>Fitur Dalam Pengembangan</AlertTitle>
                                <AlertDescription>
                                    Opsi pembayaran online akan segera tersedia. Untuk saat ini, pesanan akan diproses secara manual oleh tim kami.
                                </AlertDescription>
                            </Alert>
                            <div className="space-y-3 opacity-50 cursor-not-allowed">
                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <CreditCard className="h-6 w-6 text-gray-400" />
                                        <span className="font-medium text-gray-500">Kartu Kredit / Debit</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Banknote className="h-6 w-6 text-gray-400" />
                                        <span className="font-medium text-gray-500">Transfer Bank</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Wallet className="h-6 w-6 text-gray-400" />
                                        <span className="font-medium text-gray-500">Dompet Digital (GoPay, OVO)</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            case 2: // Konfirmasi
                return (
                    <Card className="shadow-lg border rounded-xl">
                        <CardHeader>
                            <CardTitle>Konfirmasi Pesanan</CardTitle>
                            <CardDescription>Harap tinjau kembali detail pesanan Anda sebelum menyelesaikan.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-semibold text-gray-800">Alamat Pengiriman:</h3>
                                    <Button variant="link" size="sm" className="h-auto p-0" onClick={() => setCurrentStep(0)}>Ubah</Button>
                                </div>
                                <div className="p-4 border rounded-md bg-slate-50 text-sm">
                                    <p className="font-medium">{data.shipping_address.name}</p>
                                    <p className="text-gray-600">{data.shipping_address.phone}</p>
                                    <p className="text-gray-600">{`${data.shipping_address.address}, ${data.shipping_address.city}, ${data.shipping_address.postal_code}`}</p>
                                </div>
                            </div>
                            <Separator />
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-semibold text-gray-800">Metode Pembayaran:</h3>
                                     <Button variant="link" size="sm" className="h-auto p-0" onClick={() => setCurrentStep(1)}>Ubah</Button>
                                </div>
                                <div className="p-4 border rounded-md bg-slate-50 text-sm">
                                    <p className="text-gray-600">Akan dikonfirmasi setelah pesanan dibuat.</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            default:
                return null;
        }
    };

    const summaryProps = { cartItems, total, subtotal, shippingCost, processing, currentStep, handleNextStep, handlePrevStep, handleSubmit, steps };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Checkout" />
            <div className="bg-gray-50 min-h-screen">
                <div className="container mx-auto max-w-7xl py-16 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-5xl mx-auto">
                        {/* Judul Halaman */}
                        <div className="text-center mb-12">
                             <Link href={route('welcome')} className="inline-block mb-8">
                                <img src="/storage/logo/logo.png" alt="Logo Utama" className="h-12 w-auto" />
                            </Link>
                            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">Secure Checkout</h1>
                        </div>
                    </div>

                    <div className="max-w-2xl mx-auto mb-12">
                        <Stepper steps={steps} currentStep={currentStep} />
                    </div>

                    <form onSubmit={handleSubmit}>
                        {/* Mobile: Accordion Summary */}
                        <div className="lg:hidden mb-6">
                            <Accordion type="single" collapsible defaultValue="item-1">
                                <AccordionItem value="item-1">
                                    <AccordionTrigger className="text-lg font-semibold">
                                        Lihat Ringkasans Pesanan
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <OrderSummary {...summaryProps} />
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2">
                                {renderStepContent()}
                            </div>
                            {/* Desktop: Sticky Summary */}
                            <div className="hidden lg:block lg:col-span-1">
                                <OrderSummary {...summaryProps} />
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
