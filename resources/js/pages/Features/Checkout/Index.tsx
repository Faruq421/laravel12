import { Head, useForm, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useMemo, useState } from 'react';
import { Truck, CreditCard, Banknote, ShieldCheck, ShoppingBag, Loader2, CheckCircle2, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { SharedData } from '@/types';
import SiteLayout from '@/layouts/SiteLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// --- Type Definitions ---
interface CartItem {
    id: string;
    product_id: number;
    name: string;
    price: number;
    quantity: number;
    image: string | null;
    variant?: Record<string, string> | null;
    design?: {
        type: 'template' | 'upload';
        value: string;
        original_filename?: string;
    } | null;
}

interface ShippingMethod {
    id: string;
    name: string;
    price: number;
    eta: string;
}

interface PaymentMethod {
    id: string;
    name: string;
    description: string;
}

interface Props {
    cartItems: CartItem[];
    subtotal: number;
    shippingMethods: ShippingMethod[];
    paymentMethods: PaymentMethod[];
}

type CheckoutStep = 'address' | 'shipping' | 'payment';

export default function CheckoutPage({ cartItems, subtotal, shippingMethods, paymentMethods }: Props) {
    const { auth } = usePage<SharedData>().props;
    const user = auth.user;

    // Wizard State
    const [step, setStep] = useState<CheckoutStep>('address');

    // Initialize form with useForm
    const { data, setData, post, processing, errors, transform } = useForm({
        shipping_address: {
            name: user?.name || '',
            address: '',
            city: '',
            postal_code: '',
            phone: '',
        },
        shipping_method: '', // Remove default
        payment_method: '',  // Remove default
        selected_items: cartItems.map(item => item.id),
    });

    // --- Calculations ---
    const shippingCost = useMemo(() => {
        const method = shippingMethods.find(m => m.id === data.shipping_method);
        return method ? method.price : 0;
    }, [data.shipping_method, shippingMethods]);

    const tax = subtotal * 0.11; // 11% tax
    const total = subtotal + shippingCost + tax;

    // Validation for "Pay" button
    const isFormValid = useMemo(() => {
        // Must be on the final step AND have all data
        if (step !== 'payment') return false;

        return (
            data.shipping_address.name?.trim() !== '' &&
            data.shipping_address.address?.trim() !== '' &&
            data.shipping_address.phone?.trim() !== '' &&
            data.shipping_method !== '' &&
            data.payment_method !== ''
        );
    }, [data, step]);

    // Handle form submission
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('checkout.store'));
    };

    // Step Navigation Handlers
    const goToShipping = () => {
        // Basic Client-side validation for address
        if (!data.shipping_address.name || !data.shipping_address.address || !data.shipping_address.phone) {
            // In a real app, you'd trigger form validation display here. 
            // relying on HTML5 required for now or check manually
            alert("Mohon lengkapi alamat pengiriman terlebih dahulu.");
            return;
        }
        setStep('shipping');
    };

    const goToPayment = () => {
        if (!data.shipping_method) {
            alert("Mohon pilih metode pengiriman.");
            return;
        }
        setStep('payment');
    };

    const goToAddress = () => setStep('address');

    // Get the payment method icon
    const getPaymentIcon = (methodId: string) => {
        switch (methodId) {
            case 'credit_card':
                return CreditCard;
            default:
                return Banknote;
        }
    };

    // --- Render Logic for Order Summary (Reused in Mobile & Desktop) ---
    const OrderSummaryContent = () => (
        <div className="space-y-6">
            <div className="space-y-4">
                {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-4">
                        <div className="relative h-16 w-16 flex-shrink-0 rounded-md border border-border bg-muted overflow-hidden">
                            {item.image ? (
                                <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center bg-muted text-muted-foreground text-xs">
                                    No Image
                                </div>
                            )}
                            <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-sm ring-2 ring-background">
                                {item.quantity}
                            </span>
                        </div>
                        <div className="flex flex-1 flex-col justify-center">
                            <p className="text-sm font-medium text-foreground line-clamp-2">{item.name}</p>
                            {item.variant && Object.entries(item.variant).map(([key, val]) => (
                                <p key={key} className="text-xs text-muted-foreground">{val}</p>
                            ))}
                            {item.design && (
                                <p className="text-xs text-muted-foreground">
                                    {item.design.type === 'upload' ? `Design: ${item.design.original_filename || 'Custom'}` : 'Template Design'}
                                </p>
                            )}
                        </div>
                        <div className="flex items-center text-sm font-medium text-foreground">
                            Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                        </div>
                    </div>
                ))}
            </div>

            <Separator />

            <div className="space-y-3">
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">Rp {subtotal.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Pengiriman</span>
                    <span className="font-medium">Rp {shippingCost.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Pajak (11%)</span>
                    <span className="font-medium">Rp {Math.round(tax).toLocaleString('id-ID')}</span>
                </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
                <span className="text-base font-bold text-foreground">Total</span>
                <span className="text-2xl font-bold text-primary">
                    Rp {Math.round(total).toLocaleString('id-ID')}
                </span>
            </div>
        </div>
    );


    return (
        <SiteLayout>
            <Head title="Checkout" />

            <div className="flex flex-col lg:flex-row max-w-7xl mx-auto mb-5">

                {/* --- Left Column: Forms (Wizard) --- */}
                <div className="flex-1 px-4 py-8 lg:px-12 lg:py-12 bg-background order-2 lg:order-1">

                    <div className="mb-8">
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">Checkout</h1>
                        <p className="text-muted-foreground text-sm mt-1">Lengkapi data untuk menyelesaikan pesanan.</p>
                    </div>

                    <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6 max-w-2xl">

                        {/* STEP 1: Address */}
                        <Card className={cn("border transition-all duration-300", step === 'address' ? "ring-2 ring-primary/20 shadow-md" : "opacity-80")}>
                            <CardHeader className="pb-3">
                                <CardTitle className="flex justify-between items-center text-lg">
                                    <span className="flex items-center gap-2">
                                        <div className={cn("flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold", step === 'address' ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>1</div>
                                        Alamat Pengiriman
                                    </span>
                                    {step !== 'address' && (
                                        <Button variant="ghost" size="sm" onClick={goToAddress} type="button" className="text-primary hover:text-primary/80">
                                            <Pencil className="h-4 w-4 mr-2" /> Ubah
                                        </Button>
                                    )}
                                </CardTitle>
                            </CardHeader>
                            {step === 'address' && (
                                <CardContent className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                                    {/* Contact Section */}
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-semibold text-foreground">Kontak</h3>
                                        {!user && (
                                            <a href={route('login')} className="text-sm text-primary hover:underline cursor-pointer">Login</a>
                                        )}
                                    </div>

                                    {!user && <Input placeholder="Email atau nomor handphone" className="h-11 mb-6" />}

                                    <div className="space-y-2">
                                        <Label htmlFor="name">Nama Lengkap</Label>
                                        <Input
                                            id="name"
                                            placeholder="Nama penerima"
                                            value={data.shipping_address.name}
                                            onChange={e => setData('shipping_address', { ...data.shipping_address, name: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="address">Alamat Lengkap</Label>
                                        <Input
                                            id="address"
                                            placeholder="Jalan, No. Rumah, RT/RW"
                                            value={data.shipping_address.address}
                                            onChange={e => setData('shipping_address', { ...data.shipping_address, address: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="city">Kota / Kabupaten</Label>
                                            <Input
                                                id="city"
                                                placeholder="Nama kota"
                                                value={data.shipping_address.city}
                                                onChange={e => setData('shipping_address', { ...data.shipping_address, city: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="zip">Kode Pos</Label>
                                            <Input
                                                id="zip"
                                                placeholder="Kode Pos"
                                                value={data.shipping_address.postal_code}
                                                onChange={e => setData('shipping_address', { ...data.shipping_address, postal_code: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Nomor Telepon</Label>
                                        <Input
                                            id="phone"
                                            placeholder="Untuk kurir menghubungi Anda"
                                            value={data.shipping_address.phone}
                                            onChange={e => setData('shipping_address', { ...data.shipping_address, phone: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <Button type="button" onClick={goToShipping} className="w-full mt-4 h-11">
                                        Lanjut ke Pengiriman
                                    </Button>
                                </CardContent>
                            )}
                            {step !== 'address' && (
                                <CardContent className="pb-6 pt-0">
                                    <p className="text-sm text-muted-foreground">{data.shipping_address.name} | {data.shipping_address.address}...</p>
                                </CardContent>
                            )}
                        </Card>


                        {/* STEP 2: Shipping Method */}
                        <Card className={cn("border transition-all duration-300", step === 'shipping' ? "ring-2 ring-primary/20 shadow-md" : (step === 'payment' ? "opacity-80" : "opacity-50 grayscale"))}>
                            <CardHeader className="pb-3">
                                <CardTitle className="flex justify-between items-center text-lg">
                                    <span className="flex items-center gap-2">
                                        <div className={cn("flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold", step === 'shipping' ? "bg-primary text-primary-foreground" : (step === 'payment' ? "bg-muted text-muted-foreground" : "bg-muted text-muted-foreground"))}>2</div>
                                        Metode Pengiriman
                                    </span>
                                    {step === 'payment' && (
                                        <Button variant="ghost" size="sm" onClick={goToShipping} type="button" className="text-primary hover:text-primary/80">
                                            <Pencil className="h-4 w-4 mr-2" /> Ubah
                                        </Button>
                                    )}
                                </CardTitle>
                            </CardHeader>
                            {step === 'shipping' && (
                                <CardContent className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                                    <RadioGroup
                                        value={data.shipping_method}
                                        onValueChange={(value) => setData('shipping_method', value)}
                                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                                    >
                                        {shippingMethods.map((method) => (
                                            <div key={method.id}>
                                                <RadioGroupItem value={method.id} id={`ship-${method.id}`} className="peer sr-only" />
                                                <Label
                                                    htmlFor={`ship-${method.id}`}
                                                    className="flex flex-col justify-between rounded-xl border-2 border-muted bg-transparent p-4 hover:bg-muted/50 hover:text-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 transition-all cursor-pointer h-full"
                                                >
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <Truck className="h-5 w-5 text-muted-foreground peer-data-[state=checked]:text-primary" />
                                                        <span className="font-semibold text-sm">{method.name}</span>
                                                    </div>
                                                    <div className="flex justify-between items-end w-full mt-auto">
                                                        <span className="text-xs text-muted-foreground font-medium">{method.eta}</span>
                                                        <span className="font-bold text-foreground">Rp {method.price.toLocaleString('id-ID')}</span>
                                                    </div>
                                                </Label>
                                            </div>
                                        ))}
                                    </RadioGroup>
                                    <Button type="button" onClick={goToPayment} className="w-full mt-4 h-11">
                                        Lanjut ke Pembayaran
                                    </Button>
                                </CardContent>
                            )}
                            {step === 'payment' && (
                                <CardContent className="pb-6 pt-0">
                                    <div className="flex items-center gap-2 text-sm text-foreground">
                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                        {shippingMethods.find(m => m.id === data.shipping_method)?.name}
                                    </div>
                                </CardContent>
                            )}
                        </Card>


                        {/* STEP 3: Payment Method */}
                        <Card className={cn("border transition-all duration-300", step === 'payment' ? "ring-2 ring-primary/20 shadow-md" : "opacity-50 grayscale")}>
                            <CardHeader className="pb-3">
                                <CardTitle className="flex justify-between items-center text-lg">
                                    <span className="flex items-center gap-2">
                                        <div className={cn("flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold", step === 'payment' ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>3</div>
                                        Pembayaran
                                    </span>
                                </CardTitle>
                            </CardHeader>
                            {step === 'payment' && (
                                <CardContent className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                                    <RadioGroup
                                        value={data.payment_method}
                                        onValueChange={(value) => setData('payment_method', value)}
                                        className="grid grid-cols-1 gap-4"
                                    >
                                        {paymentMethods.map((method) => {
                                            const Icon = getPaymentIcon(method.id);
                                            return (
                                                <div key={method.id}>
                                                    <RadioGroupItem value={method.id} id={`pay-${method.id}`} className="peer sr-only" />
                                                    <Label
                                                        htmlFor={`pay-${method.id}`}
                                                        className="flex items-center gap-4 rounded-xl border-2 border-muted bg-transparent p-4 hover:bg-muted/50 hover:text-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 transition-all cursor-pointer"
                                                    >
                                                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                                                            <Icon className="h-5 w-5" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="font-semibold text-sm">{method.name}</p>
                                                            <p className="text-xs text-muted-foreground">{method.description}</p>
                                                        </div>
                                                        <div className="h-4 w-4 rounded-full border border-primary flex items-center justify-center opacity-0 peer-data-[state=checked]:opacity-100 transition-opacity">
                                                            <div className="h-2 w-2 rounded-full bg-primary" />
                                                        </div>
                                                    </Label>
                                                </div>
                                            );
                                        })}
                                    </RadioGroup>

                                    <Button
                                        type="submit"
                                        disabled={processing || cartItems.length === 0}
                                        className="w-full lg:hidden h-12 text-base font-bold bg-primary hover:bg-primary/90 mt-8"
                                    >
                                        {processing ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Memproses...
                                            </>
                                        ) : (
                                            `Bayar Rp ${Math.round(total).toLocaleString('id-ID')}`
                                        )}
                                    </Button>
                                </CardContent>
                            )}
                        </Card>

                    </form>
                </div>

                {/* --- Right Column: Order Summary (Sticky Card) --- */}
                <div className="w-full lg:w-[350px] order-1 lg:order-2">

                    {/* Mobile: Accordion Toggle */}
                    <div className="lg:hidden mb-6">
                        <Accordion type="single" collapsible className="w-full bg-card rounded-lg border shadow-sm">
                            <AccordionItem value="summary" className="border-0">
                                <AccordionTrigger className="px-4 py-4 hover:no-underline">
                                    <div className="flex items-center gap-2 text-primary w-full">
                                        <ShoppingBag className="h-4 w-4" />
                                        <span className="font-semibold text-sm">Lihat Ringkasan Pesanan</span>
                                        <span className="ml-auto text-foreground font-bold mr-2">
                                            Rp {Math.round(total).toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-4 pb-6 pt-0">
                                    <Separator className="mb-4" />
                                    <OrderSummaryContent />
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>

                    {/* Desktop: Sticky Card */}
                    <div className="hidden lg:block sticky button-30 top-30 mt-16">
                        <Card className="shadow-lg border-border/50 overflow-hidden">
                            <CardHeader className="bg-muted/30 pb-4 border-b">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <ShoppingBag className="h-5 w-5 text-primary" />
                                    Ringkasan Pesanan
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                {/* Scrollable Item List */}
                                <div className="max-h-[350px] overflow-y-auto p-6 space-y-6">
                                    {cartItems.map((item) => (
                                        <div key={item.id} className="flex gap-4 group">
                                            <div className="relative h-16 w-16 flex-shrink-0 rounded-md border border-border bg-secondary overflow-hidden">
                                                {item.image ? (
                                                    <img src={item.image} alt={item.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center bg-muted text-muted-foreground text-xs">
                                                        Img
                                                    </div>
                                                )}
                                                <span className="absolute top-0 right-0 flex h-4 w-4 -mt-1 -mr-1 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                                                    {item.quantity}
                                                </span>
                                            </div>
                                            <div className="flex flex-1 flex-col justify-center">
                                                <h3 className="text-sm font-medium text-foreground line-clamp-2 leading-tight mb-1">{item.name}</h3>
                                                {item.variant && Object.values(item.variant).map((val, i) => (
                                                    <span key={i} className="text-xs text-muted-foreground inline-block mr-1">{val}</span>
                                                ))}
                                                {item.design && (
                                                    <p className="text-xs text-primary mt-0.5">
                                                        {item.design.type === 'upload' ? 'Custom Design' : 'Template'}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="font-semibold text-sm">
                                                Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Totals Section */}
                                <div className="bg-muted/20 p-6 border-t space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Subtotal</span>
                                        <span className="font-medium">Rp {subtotal.toLocaleString('id-ID')}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Pengiriman</span>
                                        <span className="font-medium text-primary">
                                            {shippingCost === 0 ? 'Gratis' : `Rp ${shippingCost.toLocaleString('id-ID')}`}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Pajak (11%)</span>
                                        <span className="font-medium">Rp {Math.round(tax).toLocaleString('id-ID')}</span>
                                    </div>

                                    <Separator className="my-2" />

                                    <div className="flex justify-between items-end mb-4">
                                        <span className="text-base font-bold text-foreground">Total Tagihan</span>
                                        <span className="text-2xl font-bold text-primary">
                                            Rp {Math.round(total).toLocaleString('id-ID')}
                                        </span>
                                    </div>

                                    <Button
                                        type="submit"
                                        form="checkout-form"
                                        disabled={!isFormValid || processing || cartItems.length === 0}
                                        className="w-full h-12 text-base font-bold bg-primary hover:bg-primary/90 shadow-sm"
                                    >
                                        {processing ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Memproses...
                                            </>
                                        ) : (
                                            'Bayar Sekarang'
                                        )}
                                    </Button>
                                    {!isFormValid && (
                                        <p className="text-center text-xs text-muted-foreground mt-2">
                                            Lengkapi data pengiriman & pembayaran untuk melanjutkan.
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                            <div className="bg-muted/30 p-4 border-t text-center">
                                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                                    <ShieldCheck className="h-3.5 w-3.5 text-green-600" />
                                    <span>Pembayaran Aman & Terenkripsi 256-bit</span>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>

            </div>
        </SiteLayout>
    );
}
