import { Head, Link, useForm } from '@inertiajs/react'; // Import Link & useForm
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { PageProps as InertiaPageProps } from '@/types';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';

// --- UI Components ---
import { Toaster, toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { ShoppingCart, Plus, Minus, Star, StarHalf, UploadCloud, X, CheckCircle2 } from 'lucide-react';

import SiteLayout from '@/layouts/SiteLayout';
import { ProductCard } from '@/components/ProductCard'; // Import ProductCard

// --- Tipe Data ---
interface ProductData extends BaseProduct {
    id_produk: number;
    deskripsi: string;
    attribute_values: AttributeValue[];
    allow_custom_design: boolean;
    design_templates: DesignTemplate[];
    enable_design_feature: boolean;
}
interface PageProps extends InertiaPageProps {
    product: ProductData;
    related_products: BaseProduct[]; // Tambahkan tipe untuk produk terkait
}

// --- Tipe untuk Item Galeri ---
type GalleryItem = {
    type: 'image' | 'template';
    thumb: string;
    full: string;
    id: number | string;
};

// --- Komponen Fungsional Terkecil ---

const StarRating = ({ rating = 4.5, totalReviews = 120 }: { rating?: number; totalReviews?: number }) => (
    <div className="flex items-center gap-2">
        <div className="flex items-center">
            {[...Array(5)].map((_, i) => {
                const ratingValue = i + 1;
                if (ratingValue <= rating) return <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />;
                if (ratingValue - 0.5 <= rating) return <StarHalf key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />;
                return <Star key={i} className="h-5 w-5 text-gray-300" />;
            })}
        </div>
        <span className="text-sm text-gray-500">({totalReviews} ulasan)</span>
    </div>
);

const ProductGallery = ({ product, onTemplateSelect, selectedTemplateId }: {
    product: ProductData;
    onTemplateSelect: (index: number) => void;
    selectedTemplateId: number | null;
}) => {
    const [api, setApi] = useState<CarouselApi>();
    const [current, setCurrent] = useState(0);

    const galleryItems: GalleryItem[] = useMemo(() => {
        const items: GalleryItem[] = [];
        items.push({ type: 'image', thumb: product.gambar_url, full: product.gambar_url, id: 'main' });
        (product.design_templates || []).forEach(tmpl => items.push({ type: 'template', thumb: `/storage/${tmpl.thumbnail_path}`, full: `/storage/${tmpl.thumbnail_path}`, id: tmpl.id }));
        return items;
    }, [product]);

    useEffect(() => {
        if (!api) return;
        setCurrent(api.selectedScrollSnap());
        api.on("select", () => setCurrent(api.selectedScrollSnap()));
    }, [api]);

    const handleThumbClick = (index: number) => {
        api?.scrollTo(index);
        const item = galleryItems[index];
        if (item.type === 'template') {
            onTemplateSelect(index);
        }
    };

    useEffect(() => {
        if (selectedTemplateId !== null) {
            const index = galleryItems.findIndex(item => item.type === 'template' && item.id === selectedTemplateId);
            if (index !== -1 && index !== current) {
                api?.scrollTo(index);
            }
        }
    }, [selectedTemplateId, galleryItems, api, current]);


    return (
        <div className="sticky top-24 flex flex-col gap-4">
            <Carousel setApi={setApi} className="w-full">
                <CarouselContent>
                    {galleryItems.map((item, index) => (
                        <CarouselItem key={index} className="aspect-square">
                            <div className="w-full h-full overflow-hidden rounded-2xl border bg-white flex items-center justify-center">
                                <img src={item.full} alt={`${product.nama_produk} - Gambar ${index + 1}`} className="h-full w-full object-cover" />
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="left-4" />
                <CarouselNext className="right-4" />
            </Carousel>
            <div className="grid grid-cols-5 gap-3">
                {galleryItems.map((item, index) => (
                    <button key={index} onClick={() => handleThumbClick(index)} className={cn("overflow-hidden rounded-lg aspect-square border-2 transition-all", current === index ? "border-orange-500" : "border-transparent hover:border-gray-300")}>
                        <img src={item.thumb} alt={`Thumbnail ${index + 1}`} className="h-full w-full object-cover" />
                    </button>
                ))}
            </div>
        </div>
    );
};

// --- Komponen Utama Halaman ---

export default function ProductShowPage({ product, related_products }: PageProps) {
    // --- State Manajemen ---
    const [quantity, setQuantity] = useState<number>(1);
    const [selectedOptions, setSelectedOptions] = useState<Record<string, number>>({});
    const [note, setNote] = useState("");
    const [selectedTemplate, setSelectedTemplate] = useState<DesignTemplate | null>(null);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // --- Logika Atribut & Harga ---
    const attributeGroups = useMemo(() => (product.attribute_values || []).reduce((acc, value) => {
        const { name } = value.attribute;
        if (!acc[name]) acc[name] = [];
        acc[name].push(value);
        return acc;
    }, {} as Record<string, AttributeValue[]>), [product.attribute_values]);

    const handleOptionChange = (attributeId: string, valueId: number) => {
        setSelectedOptions(prev => ({ ...prev, [attributeId]: valueId }));
    };

    const additionalPrice = useMemo(() => Object.values(selectedOptions).reduce((total, valueId) => {
        const selectedValue = product.attribute_values.find(v => v.id === valueId);
        return total + (selectedValue ? selectedValue.pivot.price : 0);
    }, 0), [selectedOptions, product.attribute_values]);

    const totalPrice = useMemo(() => (product.harga + additionalPrice) * quantity, [product.harga, additionalPrice, quantity]);

    // --- Logika Opsi Desain ---
    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (file) {
            setUploadedFile(file);
            setSelectedTemplate(null);
            if (previewUrl) URL.revokeObjectURL(previewUrl);
            setPreviewUrl(URL.createObjectURL(file));
        }
    }, [previewUrl]);

    useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'image/*': [] }, multiple: false });

    const removeUploadedFile = () => {
        setUploadedFile(null);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
    };

    const handleSelectTemplate = (template: DesignTemplate) => {
        setSelectedTemplate(template);
        setUploadedFile(null);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
    };

    const { data, setData, post, errors, processing } = useForm({
        product_id: product.id_produk,
        quantity: 1,
        variant: {} as Record<string, number>,
        design: null as { type: 'template' | 'upload', value: number | File | null },
        note: "",
    });

    useEffect(() => {
        setData('quantity', quantity);
    }, [quantity]);

    useEffect(() => {
        setData('variant', selectedOptions);
    }, [selectedOptions]);

    useEffect(() => {
        if (selectedTemplate) {
            setData('design', { type: 'template', value: selectedTemplate.id });
        } else if (uploadedFile) {
            setData('design', { type: 'upload', value: uploadedFile });
        } else {
            setData('design', null);
        }
    }, [selectedTemplate, uploadedFile]);

     useEffect(() => {
        setData('note', note);
    }, [note]);


    // --- Logika Tombol Aksi & Tooltip ---
    const hasAttributes = Object.keys(attributeGroups).length > 0;
    const areAllOptionsSelected = hasAttributes ? Object.keys(selectedOptions).length === Object.keys(attributeGroups).length : true;
    const isDesignSelected = !product.enable_design_feature || !!selectedTemplate || !!uploadedFile;
    const isActionDisabled = !areAllOptionsSelected || !isDesignSelected || processing;

    const getTooltipMessage = () => {
        if (!areAllOptionsSelected) return "Harap pilih semua varian produk (misal: Ukuran, Bahan).";
        if (product.enable_design_feature && !isDesignSelected) return "Harap unggah desain Anda atau pilih salah satu template kami.";
        return "";
    };

    const handleAddToCart = () => {
        post(route('cart.store'), {
            onSuccess: () => {
                toast.success(`${product.nama_produk} berhasil ditambahkan ke keranjang.`);
            },
            onError: (errors) => {
                toast.error('Gagal menambahkan produk, periksa kembali pilihan Anda.');
                console.error("Cart Error:", errors);
            }
        });
    };
    const handleBuyNow = () => toast.info(`Proses checkout untuk ${product.nama_produk}...`);

    return (
        <SiteLayout>
            <Head title={product.nama_produk} />
            <Toaster richColors position="top-center" />
            <div className="bg-gray-50 font-sans text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                <main>
                    <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                        {/* Bagian Atas: Galeri & Panel Aksi */}
                        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-2 lg:gap-16">
                            <ProductGallery product={product} onTemplateSelect={(index) => {
                                const tmpl = product.design_templates[index - 1];
                                if (tmpl) handleSelectTemplate(tmpl);
                            }} selectedTemplateId={selectedTemplate?.id ?? null} />

                            <Card className="sticky top-24 shadow-lg">
                                <CardHeader>
                                    <Breadcrumb>
                                        <BreadcrumbList>
                                            <BreadcrumbItem><BreadcrumbLink href="/">Home</BreadcrumbLink></BreadcrumbItem>
                                            <BreadcrumbSeparator />
                                            <BreadcrumbItem><BreadcrumbLink href="/products">Produk</BreadcrumbLink></BreadcrumbItem>
                                            <BreadcrumbSeparator />
                                            <BreadcrumbItem><BreadcrumbPage>{product.nama_produk}</BreadcrumbPage></BreadcrumbItem>
                                        </BreadcrumbList>
                                    </Breadcrumb>
                                    <p className="pt-4 font-semibold uppercase tracking-wide text-orange-500">{product.category?.name ?? 'Uncategorized'}</p>
                                    <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl">{product.nama_produk}</h1>
                                    <StarRating />
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <Separator />
                                    {Object.entries(attributeGroups).map(([name, values]) => (
                                        <div key={name}>
                                            <Label className='text-md mb-3 block font-semibold text-gray-800 dark:text-gray-200'>{name}</Label>
                                            <RadioGroup onValueChange={(valueId) => handleOptionChange(values[0].attribute.id.toString(), Number(valueId))} className='flex flex-wrap gap-3'>
                                                {values.map((value) => (
                                                    <Label key={value.id} htmlFor={`attr_${value.id}`} className="flex cursor-pointer items-center gap-3 rounded-lg border bg-white px-4 py-2 transition-all hover:bg-gray-100 has-[:checked]:border-orange-500 has-[:checked]:bg-orange-50 has-[:checked]:shadow-md dark:bg-gray-800 dark:hover:bg-gray-700">
                                                        <RadioGroupItem value={value.id.toString()} id={`attr_${value.id}`} />
                                                        {value.value}
                                                        {value.pivot.price > 0 && <span className='text-sm text-gray-500'>(+Rp {value.pivot.price.toLocaleString('id-ID')})</span>}
                                                    </Label>
                                                ))}
                                            </RadioGroup>
                                        </div>
                                    ))}

                                    {product.enable_design_feature && (
                                        <div>
                                            <Separator />
                                            <Label className="text-md my-3 block font-semibold text-gray-800 dark:text-gray-200">Opsi Desain</Label>
                                            <Tabs defaultValue={product.design_templates?.length > 0 ? "template" : "upload"} className="w-full">
                                                <TabsList className={cn("grid w-full", product.allow_custom_design && product.design_templates?.length > 0 ? "grid-cols-2" : "grid-cols-1")}>
                                                    {product.design_templates?.length > 0 && <TabsTrigger value="template">Pilih dari Template</TabsTrigger>}
                                                    {product.allow_custom_design && <TabsTrigger value="upload">Unggah Desain Sendiri</TabsTrigger>}
                                                </TabsList>
                                                {product.design_templates?.length > 0 && (
                                                    <TabsContent value="template" className="mt-4">
                                                        <div className='grid grid-cols-5 gap-3'>
                                                            {product.design_templates.map(template => (
                                                                <div key={template.id} className="relative">
                                                                    <button onClick={() => handleSelectTemplate(template)} className={cn('overflow-hidden rounded-lg aspect-square border-2 transition-all w-full', selectedTemplate?.id === template.id ? 'border-orange-500' : 'border-gray-200 hover:border-orange-400 dark:border-gray-700')}>
                                                                        <img src={`/storage/${template.thumbnail_path}`} alt={template.name} className='aspect-square w-full object-cover' />
                                                                    </button>
                                                                    {selectedTemplate?.id === template.id && <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-white"><CheckCircle2 className="h-4 w-4" /></div>}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </TabsContent>
                                                )}
                                                {product.allow_custom_design && (
                                                    <TabsContent value="upload" className="mt-4">
                                                        {uploadedFile ? (
                                                            <div className='relative w-full rounded-lg border p-4 text-center'>
                                                                <img src={previewUrl!} alt="Preview" className='h-24 w-full rounded-md object-contain' />
                                                                <p className='mt-2 truncate text-sm'>{uploadedFile.name}</p>
                                                                <Button variant="ghost" size="icon" className='absolute top-1 right-1 h-7 w-7' onClick={removeUploadedFile}><X className='h-4 w-4' /></Button>
                                                            </div>
                                                        ) : (
                                                            <div {...getRootProps()} className={cn('flex h-32 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors', isDragActive ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/50' : 'border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800/50')}>
                                                                <input {...getInputProps()} />
                                                                <UploadCloud className='h-8 w-8 text-gray-400' />
                                                                <p className='mt-2 text-center text-sm text-gray-500'>Seret & lepas atau klik</p>
                                                            </div>
                                                        )}
                                                    </TabsContent>
                                                )}
                                            </Tabs>
                                        </div>
                                    )}

                                    <Separator />
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <Label htmlFor="quantity" className="text-md mb-2 block font-semibold text-gray-800 dark:text-gray-200">Jumlah</Label>
                                            <div className="relative flex h-11 w-32 items-center rounded-lg border">
                                                <Button variant="outline" size="icon" onClick={() => setQuantity(q => Math.max(1, q - 1))} className="h-full rounded-r-none"><Minus className="h-4 w-4" /></Button>
                                                <Input id="quantity" type="number" value={quantity} onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} className="h-full w-full border-x border-y-0 bg-transparent p-0 text-center text-lg font-bold focus-visible:ring-0 focus-visible:ring-offset-0" />
                                                <Button variant="outline" size="icon" onClick={() => setQuantity(q => q + 1)} className="h-full rounded-l-none"><Plus className="h-4 w-4" /></Button>
                                            </div>
                                        </div>
                                        <div>
                                            <Label htmlFor="note" className="text-md mb-2 block font-semibold text-gray-800 dark:text-gray-200">Catatan (Opsional)</Label>
                                            <Textarea id="note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Tulis catatan..." className="w-full md:w-64" />
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex-col gap-4">
                                    <Separator />
                                    <div className="w-full space-y-2">
                                        <div className="flex justify-between text-gray-600 dark:text-gray-300"><span>Harga Dasar</span><span>Rp {product.harga.toLocaleString('id-ID')}</span></div>
                                        <div className="flex justify-between text-gray-600 dark:text-gray-300"><span>Biaya Tambahan</span><span>Rp {additionalPrice.toLocaleString('id-ID')}</span></div>
                                        <Separator className="my-2" />
                                        <div className="flex justify-between text-xl font-bold text-gray-900 dark:text-gray-100"><span>Total Harga</span><span>Rp {totalPrice.toLocaleString('id-ID')}</span></div>
                                    </div>
                                    <TooltipProvider delayDuration={100}>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div className="w-full grid grid-cols-2 gap-3">
                                                    <Button size="lg" variant="outline" onClick={handleBuyNow} disabled={isActionDisabled} className="py-6 text-lg">Beli Sekarang</Button>
                                                    <Button size="lg" onClick={handleAddToCart} disabled={isActionDisabled} className="w-full bg-[#FF6500] py-6 text-lg text-white shadow-lg transition-transform duration-200 hover:scale-105 hover:bg-[#FF6500]/90 disabled:cursor-not-allowed disabled:bg-gray-400">
                                                        <ShoppingCart className="mr-3 h-6 w-6" />
                                                        Keranjang
                                                    </Button>
                                                </div>
                                            </TooltipTrigger>
                                            {isActionDisabled && <TooltipContent><p>{getTooltipMessage()}</p></TooltipContent>}
                                        </Tooltip>
                                    </TooltipProvider>
                                </CardFooter>
                            </Card>
                        </div>

                        {/* Bagian Bawah: Informasi Tambahan (Full Width) */}
                        <div className="mt-24">
                            <Tabs defaultValue="description">
                                <TabsList className="grid w-full grid-cols-3 md:w-[400px] mx-auto">
                                    <TabsTrigger value="description">Deskripsi Lengkap</TabsTrigger>
                                    <TabsTrigger value="specifications">Spesifikasi</TabsTrigger>
                                    <TabsTrigger value="reviews">Ulasan</TabsTrigger>
                                </TabsList>
                                <TabsContent value="description" className="prose dark:prose-invert max-w-none mt-6 text-gray-600 dark:text-gray-300"><p>{product.deskripsi}</p></TabsContent>
                                <TabsContent value="specifications" className="mt-6 text-gray-600 dark:text-gray-300"><p>Informasi spesifikasi produk akan ditampilkan di sini.</p></TabsContent>
                                <TabsContent value="reviews" className="mt-6 text-gray-600 dark:text-gray-300"><p>Ulasan dari pelanggan akan ditampilkan di sini.</p></TabsContent>
                            </Tabs>
                        </div>

                        {/* Bagian Bawah: Rekomendasi Produk (Full Width) */}
                        {related_products && related_products.length > 0 && (
                            <div className="mt-24">
                                <h2 className="text-3xl font-bold tracking-tight text-center text-gray-900 dark:text-gray-100">
                                    Anda Mungkin Juga Suka
                                </h2>
                                <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                                    {related_products.map((related_product) => (
                                        <ProductCard key={related_product.slug} product={related_product} />
                                    ))}
                                 </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </SiteLayout>
    );
}