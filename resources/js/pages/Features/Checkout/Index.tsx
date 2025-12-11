import { Head, useForm, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useMemo } from 'react';
import { Truck, CreditCard, Banknote, ShieldCheck, ShoppingBag, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { SharedData } from '@/types';
import SiteLayout from '@/layouts/SiteLayout';

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

export default function CheckoutPage({ cartItems, subtotal, shippingMethods, paymentMethods }: Props) {
    const { auth } = usePage<SharedData>().props;
    const user = auth.user;

    // Initialize form with useForm
    const { data, setData, post, processing, errors } = useForm({
        shipping_address: {
            name: user?.name || '',
            address: '',
            city: '',
            postal_code: '',
            phone: '',
        },
        shipping_method: shippingMethods[0]?.id || 'jne',
        payment_method: paymentMethods[0]?.id || 'bca',
        selected_items: cartItems.map(item => item.id),
    });

    // --- Calculations ---
    const shippingCost = useMemo(() => {
        const method = shippingMethods.find(m => m.id === data.shipping_method);
        return method ? method.price : 0;
    }, [data.shipping_method, shippingMethods]);

    const tax = subtotal * 0.11; // 11% tax
    const total = subtotal + shippingCost + tax;

    // Handle form submission
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('checkout.store'));
    };

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

            <Button
                type="submit"
                form="checkout-form"
                disabled={processing || cartItems.length === 0}
                className="w-full h-12 text-base font-bold bg-primary hover:bg-primary/90 mt-4"
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
        </div>
    );


    return (
        <SiteLayout>
            <Head title="Checkout" />

            <div className="flex flex-col lg:flex-row max-w-7xl mx-auto">

                {/* --- Left Column: Forms (Input) --- */}
                <div className="flex-1 px-4 py-8 lg:px-12 lg:py-12 bg-background order-2 lg:order-1">

                    {/* Breadcrumb / Back Link Placeholder (Optional) */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">Checkout</h1>
                        <p className="text-muted-foreground text-sm mt-1">Lengkapi data untuk menyelesaikan pesanan.</p>
                    </div>

                    <form id="checkout-form" onSubmit={handleSubmit} className="space-y-8 max-w-2xl">

                        {/* 1. Contact Info */}
                        <section className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-foreground">Kontak</h2>
                                {!user && (
                                    <a href={route('login')} className="text-sm text-primary hover:underline cursor-pointer">Login</a>
                                )}
                            </div>
                            {user ? (
                                <p className="text-sm text-muted-foreground">
                                    Memesan sebagai <span className="font-medium text-foreground">{user.email}</span>
                                </p>
                            ) : (
                                <Input placeholder="Email atau nomor handphone" className="h-11" />
                            )}
                        </section>

                        <Separator />

                        {/* 2. Shipping Address */}
                        <section className="space-y-4">
                            <h2 className="text-lg font-semibold text-foreground">Alamat Pengiriman</h2>

                            <div className="space-y-2">
                                <Label htmlFor="name">Nama Lengkap</Label>
                                <Input
                                    id="name"
                                    placeholder="Nama penerima"
                                    value={data.shipping_address.name}
                                    onChange={e => setData('shipping_address', { ...data.shipping_address, name: e.target.value })}
                                />
                                {errors['shipping_address.name'] && (
                                    <p className="text-sm text-destructive">{errors['shipping_address.name']}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address">Alamat Lengkap</Label>
                                <Input
                                    id="address"
                                    placeholder="Jalan, No. Rumah, RT/RW"
                                    value={data.shipping_address.address}
                                    onChange={e => setData('shipping_address', { ...data.shipping_address, address: e.target.value })}
                                />
                                {errors['shipping_address.address'] && (
                                    <p className="text-sm text-destructive">{errors['shipping_address.address']}</p>
                                )}
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
                                    {errors['shipping_address.city'] && (
                                        <p className="text-sm text-destructive">{errors['shipping_address.city']}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="zip">Kode Pos</Label>
                                    <Input
                                        id="zip"
                                        placeholder="Kode Pos"
                                        value={data.shipping_address.postal_code}
                                        onChange={e => setData('shipping_address', { ...data.shipping_address, postal_code: e.target.value })}
                                    />
                                    {errors['shipping_address.postal_code'] && (
                                        <p className="text-sm text-destructive">{errors['shipping_address.postal_code']}</p>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Nomor Telepon</Label>
                                <Input
                                    id="phone"
                                    placeholder="Untuk kurir menghubungi Anda"
                                    value={data.shipping_address.phone}
                                    onChange={e => setData('shipping_address', { ...data.shipping_address, phone: e.target.value })}
                                />
                                {errors['shipping_address.phone'] && (
                                    <p className="text-sm text-destructive">{errors['shipping_address.phone']}</p>
                                )}
                            </div>
                        </section>

                        <Separator />

                        {/* 3. Shipping Method */}
                        <section className="space-y-4">
                            <h2 className="text-lg font-semibold text-foreground">Metode Pengiriman</h2>
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
                            {errors.shipping_method && (
                                <p className="text-sm text-destructive">{errors.shipping_method}</p>
                            )}
                        </section>

                        <Separator />

                        {/* 4. Payment Method */}
                        <section className="space-y-4">
                            <h2 className="text-lg font-semibold text-foreground">Pembayaran</h2>
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
                            {errors.payment_method && (
                                <p className="text-sm text-destructive">{errors.payment_method}</p>
                            )}
                        </section>

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

                    </form>
                </div>

                {/* --- Right Column: Order Summary (Sticky) --- */}
                <div className="w-full lg:w-[450px] bg-muted/30 lg:border-l border-border order-1 lg:order-2">

                    {/* Mobile: Accordion Toggle */}
                    <div className="lg:hidden">
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="summary" className="border-b border-border">
                                <AccordionTrigger className="px-4 py-4 hover:no-underline bg-muted/50">
                                    <div className="flex items-center gap-2 text-primary w-full">
                                        <ShoppingBag className="h-4 w-4" />
                                        <span className="font-semibold text-sm">Lihat Ringkasan Pesanan</span>
                                        <span className="ml-auto text-foreground font-bold mr-2">
                                            Rp {Math.round(total).toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-4 pt-4 pb-6 bg-muted/30">
                                    <OrderSummaryContent />
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>

                    {/* Desktop: Sticky Sidebar */}
                    <div className="hidden lg:block sticky top-20 p-8 h-[calc(100vh-80px)] overflow-y-auto">
                        <OrderSummaryContent />

                        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                            <ShieldCheck className="h-3.5 w-3.5 text-green-600" />
                            <span>Pembayaran Anda aman & terenkripsi</span>
                        </div>
                    </div>
                </div>

            </div>
        </SiteLayout>
    );
}
