import { Head, useForm, usePage, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useEffect, useMemo, useState } from 'react';
import { Truck, CreditCard, Banknote, ShieldCheck, ShoppingBag, Loader2, CheckCircle2, Pencil } from 'lucide-react';
import { toast } from 'sonner';

// Midtrans Snap type declaration
declare global {
    interface Window {
        snap: {
            pay: (
                token: string,
                options: {
                    onSuccess?: (result: unknown) => void;
                    onPending?: (result: unknown) => void;
                    onError?: (result: unknown) => void;
                    onClose?: () => void;
                }
            ) => void;
        };
    }
}
import { cn } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { SharedData } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import axios from 'axios';

import SiteLayout from '@/layouts/SiteLayout';

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

interface Province {
    id: number;
    name: string;
}

interface City {
    id: number;
    name: string;
    type: string;
    postal_code: string;
}

interface ShippingOption {
    id: string;
    courier: string;
    courier_name: string;
    service: string;
    description: string;
    cost: number;
    etd: string;
}

interface PaymentMethod {
    id: string;
    name: string;
    description: string;
}

interface Props {
    cartItems: CartItem[];
    subtotal: number;
    paymentMethods: PaymentMethod[];
}

type CheckoutStep = 'address' | 'shipping';

export default function CheckoutPage({ cartItems, subtotal, paymentMethods }: Props) {
    const { auth } = usePage<SharedData>().props;
    const user = auth.user;

    // Wizard State
    const [step, setStep] = useState<CheckoutStep>('address');

    // Province/City State
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [cities, setCities] = useState<City[]>([]);
    const [isLoadingProvinces, setIsLoadingProvinces] = useState(true);
    const [isLoadingCities, setIsLoadingCities] = useState(false);

    // Shipping Options State
    const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
    const [isLoadingShipping, setIsLoadingShipping] = useState(false);
    const [shippingError, setShippingError] = useState<string | null>(null);

    // Selected IDs for cascading selects
    const [selectedProvinceId, setSelectedProvinceId] = useState<string>('');
    const [selectedCityId, setSelectedCityId] = useState<string>('');

    // Calculate total weight (assume 500g per item for now, can be improved later)
    const totalWeight = useMemo(() => {
        return cartItems.reduce((acc, item) => acc + (item.quantity * 500), 0);
    }, [cartItems]);

    // Initialize form with useForm (for data management only, not submission)
    const { data, setData, errors, setError, clearErrors } = useForm({
        shipping_address: {
            name: user?.name || '',
            address: '',
            city: '',
            city_id: 0,
            province: '',
            province_id: 0,
            postal_code: '',
            phone: '',
        },
        shipping_method: {
            courier: '',
            service: '',
            cost: 0,
            etd: '',
        },
        selected_items: cartItems.map(item => item.id),
    });

    // Fetch provinces on mount
    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                const response = await fetch('/shipping/provinces');
                const result = await response.json();
                if (result.success) {
                    setProvinces(result.data);
                }
            } catch (error) {
                console.error('Failed to fetch provinces:', error);
            } finally {
                setIsLoadingProvinces(false);
            }
        };
        fetchProvinces();
    }, []);

    // Fetch cities when province changes
    useEffect(() => {
        if (!selectedProvinceId) {
            setCities([]);
            return;
        }

        const fetchCities = async () => {
            setIsLoadingCities(true);
            setCities([]);
            setSelectedCityId('');
            setShippingOptions([]);

            try {
                const response = await fetch(`/shipping/cities/${selectedProvinceId}`);
                const result = await response.json();
                if (result.success) {
                    setCities(result.data);
                }
            } catch (error) {
                console.error('Failed to fetch cities:', error);
            } finally {
                setIsLoadingCities(false);
            }
        };
        fetchCities();
    }, [selectedProvinceId]);

    // Fetch shipping options when city is selected
    useEffect(() => {
        if (!selectedCityId) {
            setShippingOptions([]);
            return;
        }

        const fetchShippingOptions = async () => {
            setIsLoadingShipping(true);
            setShippingError(null);
            setShippingOptions([]);

            console.log('Fetching shipping options for city:', selectedCityId, 'weight:', totalWeight);

            try {
                const response = await axios.post('/shipping/all-options', {
                    destination: parseInt(selectedCityId),
                    weight: totalWeight,
                });

                const result = response.data;
                console.log('Shipping API response:', result);

                if (result.success) {
                    console.log('Setting shipping options:', result.data.length, 'options');
                    setShippingOptions(result.data);
                } else {
                    console.error('Shipping API error:', result.message);
                    setShippingError(result.message || 'Gagal mengambil opsi pengiriman');
                }
            } catch (error: any) {
                console.error('Failed to fetch shipping options:', error);
                const message = error.response?.data?.message || 'Gagal terhubung ke layanan pengiriman';
                setShippingError(message);
            } finally {
                setIsLoadingShipping(false);
            }
        };
        fetchShippingOptions();
    }, [selectedCityId, totalWeight]);

    // Handle province selection
    const handleProvinceChange = (provinceId: string) => {
        setSelectedProvinceId(provinceId);
        const province = provinces.find(p => p.id.toString() === provinceId);
        if (province) {
            setData('shipping_address', {
                ...data.shipping_address,
                province: province.name,
                province_id: province.id,
                city: '',
                city_id: 0,
            });
        }
    };

    // Handle city selection
    const handleCityChange = (cityId: string) => {
        setSelectedCityId(cityId);
        const city = cities.find(c => c.id.toString() === cityId);
        if (city) {
            setData('shipping_address', {
                ...data.shipping_address,
                city: `${city.type} ${city.name}`,
                city_id: city.id,
                postal_code: city.postal_code || '',
            });
        }
    };

    // Handle shipping method selection
    const handleShippingMethodChange = (optionId: string) => {
        const option = shippingOptions.find(o => o.id === optionId);
        if (option) {
            setData('shipping_method', {
                courier: option.courier,
                service: option.service,
                cost: option.cost,
                etd: option.etd,
            });
        }
    };

    // --- Calculations ---
    const shippingCost = useMemo(() => {
        return data.shipping_method.cost || 0;
    }, [data.shipping_method.cost]);

    const tax = subtotal * 0.11; // 11% tax
    const total = subtotal + shippingCost + tax;

    // Validation for "Pay" button - now only validates address and shipping
    const isFormValid = useMemo(() => {
        if (step !== 'shipping') return false;

        return (
            data.shipping_address.name?.trim() !== '' &&
            data.shipping_address.address?.trim() !== '' &&
            data.shipping_address.phone?.trim() !== '' &&
            data.shipping_address.city_id !== 0 &&
            data.shipping_address.province_id !== 0 &&
            data.shipping_method.cost > 0
        );
    }, [data, step]);

    // State for payment processing
    const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);

    // Handle form submission - creates order and triggers payment popup
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsPaymentProcessing(true);
        clearErrors();

        try {
            console.log('Submitting checkout form with data:', data);
            const response = await axios.post(route('checkout.store'), data);

            if (response.data.success && response.data.snap_token) {
                const { snap_token, order_id } = response.data;

                console.log('Order created, opening payment popup...');

                // Open Midtrans Snap popup
                if (window.snap) {
                    window.snap.pay(snap_token, {
                        onSuccess: (result: unknown) => {
                            console.log('Payment success:', result);
                            toast.success('Pembayaran berhasil!');
                            router.visit(route('orders.show', order_id));
                        },
                        onPending: (result: unknown) => {
                            console.log('Payment pending:', result);
                            toast.info('Menunggu pembayaran. Silakan selesaikan pembayaran Anda.');
                            router.visit(route('orders.show', order_id));
                        },
                        onError: (result: unknown) => {
                            console.error('Payment error:', result);
                            toast.error('Pembayaran gagal. Silakan coba lagi.');
                            router.visit(route('orders.show', order_id));
                        },
                        onClose: () => {
                            console.log('Payment popup closed');
                            toast.info('Anda menutup popup pembayaran. Pesanan tetap tersimpan.');
                            router.visit(route('orders.show', order_id));
                        },
                    });
                } else {
                    toast.error('Midtrans tidak tersedia. Silakan refresh halaman.');
                    setIsPaymentProcessing(false);
                }
            } else {
                toast.error(response.data.error || 'Gagal membuat pesanan.');
                setIsPaymentProcessing(false);
            }
        } catch (error: unknown) {
            console.error('Checkout error:', error);
            if (axios.isAxiosError(error) && error.response?.data?.error) {
                toast.error(error.response.data.error);
            } else {
                toast.error('Terjadi kesalahan. Silakan coba lagi.');
            }
            setIsPaymentProcessing(false);
        }
    };

    // Initiate Midtrans Snap payment
    const initiatePayment = async (orderId: number) => {
        try {
            const response = await axios.post(route('payment.createToken', { order: orderId }));
            const { snap_token } = response.data;

            if (snap_token && window.snap) {
                window.snap.pay(snap_token, {
                    onSuccess: (result) => {
                        console.log('Payment success:', result);
                        toast.success('Pembayaran berhasil!');
                        router.visit(route('orders.show', orderId));
                    },
                    onPending: (result) => {
                        console.log('Payment pending:', result);
                        toast.info('Pembayaran sedang diproses. Silakan selesaikan pembayaran Anda.');
                        router.visit(route('orders.show', orderId));
                    },
                    onError: (result) => {
                        console.error('Payment error:', result);
                        toast.error('Pembayaran gagal. Silakan coba lagi.');
                        router.visit(route('orders.show', orderId));
                    },
                    onClose: () => {
                        console.log('Payment popup closed');
                        toast.info('Anda menutup popup pembayaran. Pesanan Anda tetap tersimpan.');
                        router.visit(route('orders.show', orderId));
                    },
                });
            } else {
                toast.error('Midtrans Snap tidak tersedia. Silakan refresh halaman.');
                setIsPaymentProcessing(false);
            }
        } catch (error) {
            console.error('Failed to create payment token:', error);
            toast.error('Gagal memulai pembayaran. Silakan coba lagi dari halaman pesanan.');
            router.visit(route('orders.show', orderId));
        }
    };

    // Step Navigation Handlers
    const goToShipping = () => {
        // Basic Client-side validation for address
        if (!data.shipping_address.name || !data.shipping_address.address || !data.shipping_address.phone || !selectedCityId) {
            alert("Mohon lengkapi alamat pengiriman terlebih dahulu.");
            return;
        }
        setStep('shipping');
    };

    const goToPayment = () => {
        // Now we skip the payment step and go directly to submit
        if (data.shipping_method.cost === 0) {
            alert("Mohon pilih metode pengiriman.");
            return;
        }
        // Stay on shipping step, user will click "Bayar Sekarang" button
    };

    const goToAddress = () => setStep('address');
    const goToShippingStep = () => setStep('shipping');

    // Get the payment method icon
    const getPaymentIcon = (methodId: string) => {
        switch (methodId) {
            case 'credit_card':
                return CreditCard;
            default:
                return Banknote;
        }
    };

    // Get selected shipping option for display
    const selectedShippingOption = useMemo(() => {
        if (!data.shipping_method.courier || !data.shipping_method.service) return null;
        return shippingOptions.find(
            o => o.courier === data.shipping_method.courier && o.service === data.shipping_method.service
        );
    }, [data.shipping_method, shippingOptions]);

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
                                            className={cn(errors['shipping_address.name'] && "border-destructive")}
                                            required
                                        />
                                        {errors['shipping_address.name'] && (
                                            <p className="text-xs text-destructive mt-1">{errors['shipping_address.name']}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="address">Alamat Lengkap</Label>
                                        <Input
                                            id="address"
                                            placeholder="Jalan, No. Rumah, RT/RW"
                                            value={data.shipping_address.address}
                                            onChange={e => setData('shipping_address', { ...data.shipping_address, address: e.target.value })}
                                            className={cn(errors['shipping_address.address'] && "border-destructive")}
                                            required
                                        />
                                        {errors['shipping_address.address'] && (
                                            <p className="text-xs text-destructive mt-1">{errors['shipping_address.address']}</p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="province">Provinsi</Label>
                                            <Select
                                                value={selectedProvinceId}
                                                onValueChange={handleProvinceChange}
                                                disabled={isLoadingProvinces}
                                            >
                                                <SelectTrigger className="h-11">
                                                    <SelectValue placeholder={isLoadingProvinces ? "Memuat..." : "Pilih Provinsi"} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {provinces.map((province) => (
                                                        <SelectItem key={province.id} value={province.id.toString()}>
                                                            {province.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors['shipping_address.province_id'] && (
                                                <p className="text-xs text-destructive mt-1">{errors['shipping_address.province_id']}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="city">Kota / Kabupaten</Label>
                                            <Select
                                                value={selectedCityId}
                                                onValueChange={handleCityChange}
                                                disabled={!selectedProvinceId || isLoadingCities}
                                            >
                                                <SelectTrigger className="h-11">
                                                    <SelectValue placeholder={
                                                        isLoadingCities ? "Memuat..." :
                                                            !selectedProvinceId ? "Pilih Provinsi dulu" :
                                                                "Pilih Kota"
                                                    } />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {cities.map((city) => (
                                                        <SelectItem key={city.id} value={city.id.toString()}>
                                                            {city.type} {city.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors['shipping_address.city_id'] && (
                                                <p className="text-xs text-destructive mt-1">{errors['shipping_address.city_id']}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="zip">Kode Pos</Label>
                                            <Input
                                                id="zip"
                                                placeholder="Kode Pos"
                                                value={data.shipping_address.postal_code}
                                                onChange={e => setData('shipping_address', { ...data.shipping_address, postal_code: e.target.value })}
                                                className={cn(errors['shipping_address.postal_code'] && "border-destructive")}
                                            />
                                            {errors['shipping_address.postal_code'] && (
                                                <p className="text-xs text-destructive mt-1">{errors['shipping_address.postal_code']}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Nomor Telepon</Label>
                                            <Input
                                                id="phone"
                                                placeholder="Untuk kurir menghubungi Anda"
                                                value={data.shipping_address.phone}
                                                onChange={e => setData('shipping_address', { ...data.shipping_address, phone: e.target.value })}
                                                className={cn(errors['shipping_address.phone'] && "border-destructive")}
                                                required
                                            />
                                            {errors['shipping_address.phone'] && (
                                                <p className="text-xs text-destructive mt-1">{errors['shipping_address.phone']}</p>
                                            )}
                                        </div>
                                    </div>

                                    <Button type="button" onClick={goToShipping} className="w-full mt-4 h-11" disabled={!selectedCityId}>
                                        {!selectedCityId ? 'Pilih Kota Terlebih Dahulu' : 'Lanjut ke Pengiriman'}
                                    </Button>
                                </CardContent>
                            )}
                            {step !== 'address' && (
                                <CardContent className="pb-6 pt-0">
                                    <p className="text-sm text-muted-foreground">{data.shipping_address.name} | {data.shipping_address.city} | {data.shipping_address.address}</p>
                                </CardContent>
                            )}
                        </Card>


                        {/* STEP 2: Shipping Method & Payment */}
                        <Card className={cn("border transition-all duration-300", step === 'shipping' ? "ring-2 ring-primary/20 shadow-md" : "opacity-50 grayscale")}>
                            <CardHeader className="pb-3">
                                <CardTitle className="flex justify-between items-center text-lg">
                                    <span className="flex items-center gap-2">
                                        <div className={cn("flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold", step === 'shipping' ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>2</div>
                                        Metode Pengiriman & Pembayaran
                                    </span>
                                </CardTitle>
                            </CardHeader>
                            {step === 'shipping' && (
                                <CardContent className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                                    {isLoadingShipping ? (
                                        <div className="flex items-center justify-center py-8">
                                            <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                                            <span className="text-muted-foreground">Mengambil opsi pengiriman...</span>
                                        </div>
                                    ) : shippingError ? (
                                        <div className="text-center py-8 text-destructive">
                                            <p>{shippingError}</p>
                                            <Button
                                                variant="outline"
                                                className="mt-4"
                                                onClick={() => {
                                                    const tempCity = selectedCityId;
                                                    setSelectedCityId('');
                                                    setTimeout(() => setSelectedCityId(tempCity), 100);
                                                }}
                                            >
                                                Coba Lagi
                                            </Button>
                                        </div>
                                    ) : shippingOptions.length === 0 ? (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <p>Tidak ada opsi pengiriman tersedia untuk lokasi ini.</p>
                                        </div>
                                    ) : (
                                        <RadioGroup
                                            value={data.shipping_method.courier && data.shipping_method.service
                                                ? `${data.shipping_method.courier.toLowerCase()}_${data.shipping_method.service.toLowerCase().replace(/ /g, '_')}`
                                                : ''
                                            }
                                            onValueChange={handleShippingMethodChange}
                                            className="grid grid-cols-1 md:grid-cols-2 gap-4"
                                        >
                                            {shippingOptions.map((option) => (
                                                <div key={option.id}>
                                                    <RadioGroupItem value={option.id} id={`ship-${option.id}`} className="peer sr-only" />
                                                    <Label
                                                        htmlFor={`ship-${option.id}`}
                                                        className="flex flex-col justify-between rounded-xl border-2 border-muted bg-transparent p-4 hover:bg-muted/50 hover:text-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 transition-all cursor-pointer h-full"
                                                    >
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <Truck className="h-5 w-5 text-muted-foreground peer-data-[state=checked]:text-primary" />
                                                            <div>
                                                                <span className="font-semibold text-sm">{option.courier}</span>
                                                                <span className="text-xs text-muted-foreground ml-2">{option.service}</span>
                                                            </div>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground mb-2 line-clamp-1">{option.description}</p>
                                                        <div className="flex justify-between items-end w-full mt-auto">
                                                            <span className="text-xs text-muted-foreground font-medium">{option.etd} hari</span>
                                                            <span className="font-bold text-foreground">Rp {option.cost.toLocaleString('id-ID')}</span>
                                                        </div>
                                                    </Label>
                                                </div>
                                            ))}
                                        </RadioGroup>
                                    )}
                                    {errors['shipping_method'] && (
                                        <p className="text-sm text-destructive font-medium">{errors['shipping_method']}</p>
                                    )}
                                    <Button
                                        type="submit"
                                        className="w-full mt-4 h-12 text-base font-bold bg-primary hover:bg-primary/90"
                                        disabled={data.shipping_method.cost === 0 || isPaymentProcessing}
                                    >
                                        {isPaymentProcessing ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Memproses Pembayaran...
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
                                            {shippingCost === 0 ? '-' : `Rp ${shippingCost.toLocaleString('id-ID')}`}
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
                                        disabled={!isFormValid || isPaymentProcessing || cartItems.length === 0}
                                        className="w-full h-12 text-base font-bold bg-primary hover:bg-primary/90 shadow-sm"
                                    >
                                        {isPaymentProcessing ? (
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
                                            Lengkapi data pengiriman untuk melanjutkan pembayaran.
                                        </p>
                                    )}
                                    {Object.keys(errors).length > 0 && (
                                        <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3 mt-4">
                                            <p className="text-xs text-destructive text-center font-medium">
                                                Terjadi kesalahan validasi. Mohon periksa kembali data Anda.
                                            </p>
                                        </div>
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
