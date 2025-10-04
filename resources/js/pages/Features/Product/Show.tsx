import { Input } from '@/components/ui/input';
import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Toaster, toast } from 'sonner';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, Plus, Minus, UploadCloud, X, Eye } from 'lucide-react';
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Header from '@/pages/welcome/partials/Header';
import Footer from '@/pages/welcome/partials/Footer';
import { PageProps as InertiaPageProps } from '@/types';
import {
    Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';

// --- Tipe Data ---
interface AttributeValue { id: number; value: string; attribute: { id: number; name: string; }; pivot: { price: number; }; }
interface DesignTemplate { id: number; name: string; thumbnail_path: string; }
interface ProductData {
    id_produk: number; nama_produk: string; deskripsi: string; harga: number; gambar_url: string;
    category: { name: string }; attribute_values: AttributeValue[];
    allow_custom_design: boolean; design_templates: DesignTemplate[];
    enable_design_feature: boolean;
}
interface PageProps extends InertiaPageProps { product: ProductData; }

export default function ProductShowPage({ product, auth }: PageProps) {
    // --- State Manajemen ---
    const [quantity, setQuantity] = useState<number | string>(1);
    const [selectedOptions, setSelectedOptions] = useState<Record<string, number>>({});
    const [designSource, setDesignSource] = useState<'upload' | 'template' | null>(null);
    const [selectedTemplate, setSelectedTemplate] = useState<DesignTemplate | null>(null);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [viewingTemplate, setViewingTemplate] = useState<DesignTemplate | null>(null);

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

    const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // Hanya izinkan angka atau string kosong
        if (/^\d*$/.test(value)) {
            setQuantity(value);
        }
    };

    const handleQuantityBlur = () => {
        const numQuantity = Number(quantity);
        if (isNaN(numQuantity) || numQuantity < 1) {
            setQuantity(1);
        } else {
            setQuantity(numQuantity);
        }
    };


    const totalPrice = useMemo(() => {
        const attributesPrice = Object.values(selectedOptions).reduce((total, valueId) => {
            const selectedValue = product.attribute_values.find(v => v.id === valueId);
            return total + (selectedValue ? selectedValue.pivot.price : 0);
        }, 0);
        return (product.harga + attributesPrice) * Number(quantity);
    }, [selectedOptions, quantity, product.harga, product.attribute_values]);

    // --- Logika Opsi Desain ---
    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (file) {
            setUploadedFile(file);
            setDesignSource('upload');
            setSelectedTemplate(null);
            setPreviewUrl(URL.createObjectURL(file));
        }
    }, []);

    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'image/*': [] }, multiple: false });

    const removeUploadedFile = () => {
        setUploadedFile(null);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
        setDesignSource(null);
    };

    const handleSelectTemplate = (template: DesignTemplate) => {
        setSelectedTemplate(template);
        setDesignSource('template');
        setUploadedFile(null);
        setIsModalOpen(false);
    };

    // --- Logika Tombol Aksi & Tooltip ---
    const hasAttributes = Object.keys(attributeGroups).length > 0;
    const areAllOptionsSelected = hasAttributes ? Object.keys(selectedOptions).length === Object.keys(attributeGroups).length : true;
    const isDesignSelected = !product.enable_design_feature || !!selectedTemplate || !!uploadedFile;
    const isAddToCartDisabled = !areAllOptionsSelected || !isDesignSelected;

    const getTooltipMessage = () => {
        if (!areAllOptionsSelected) return "Harap pilih semua opsi atribut (misal: Ukuran, Bahan).";
        if (product.enable_design_feature && !isDesignSelected) return "Harap unggah desain Anda atau pilih salah satu template kami.";
        return "";
    };

    const handleAddToCart = () => {
        toast.success(`${product.nama_produk} berhasil ditambahkan ke keranjang.`);
    };

    // --- Render Komponen ---
    const renderDesignOptions = () => {
        if (!product.enable_design_feature) {
            return null;
        }

        const allowUpload = product.allow_custom_design;
        const hasTemplates = product.design_templates && product.design_templates.length > 0;

        if (!allowUpload && !hasTemplates) return null;

        const templateGallery = (
            <div className='mt-4'>
                <h3 className='text-md mb-3 font-semibold text-gray-800 dark:text-gray-200'>Template Tersedia</h3>
                <div className='grid grid-cols-3 gap-4 sm:grid-cols-4'>
                    {product.design_templates.map(template => (
                        <div
                            key={template.id}
                            className={cn(
                                'relative cursor-pointer overflow-hidden rounded-lg border-2 transition-all duration-200',
                                selectedTemplate?.id === template.id ? 'border-orange-500 shadow-lg' : 'border-transparent hover:border-orange-300'
                            )}
                            onClick={() => { setViewingTemplate(template); setIsModalOpen(true); }}
                        >
                            <img src={`/storage/${template.thumbnail_path}`} alt={template.name} className='aspect-square w-full object-cover' />
                            <div className='absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity duration-200 hover:opacity-100'>
                                <Eye className='h-6 w-6 text-white' />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );

        const uploadArea = (
            <div className='mt-4'>
                {uploadedFile ? (
                    <div className='relative w-full rounded-lg border p-4'>
                        <img src={previewUrl!} alt="Preview" className='h-32 w-full rounded-md object-contain' />
                        <p className='mt-2 truncate text-center text-sm'>{uploadedFile.name}</p>
                        <Button variant="ghost" size="icon" className='absolute top-1 right-1 h-7 w-7' onClick={removeUploadedFile}>
                            <X className='h-4 w-4' />
                        </Button>
                    </div>
                ) : (
                    <div {...getRootProps()} className={cn('flex h-32 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed', isDragActive ? 'border-orange-500 bg-orange-50' : 'border-gray-300 hover:bg-gray-50')}>
                        <input {...getInputProps()} />
                        <UploadCloud className='h-8 w-8 text-gray-400' />
                        <p className='mt-2 text-center text-sm text-gray-500'>Seret & lepas atau klik untuk mengunggah</p>
                    </div>
                )}
            </div>
        );

        return (
            <>
                <Separator className='my-6' />
                <div className='space-y-6'>
                    <h2 className='text-xl font-bold text-gray-900 dark:text-gray-100'>Opsi Desain</h2>
                    {allowUpload && hasTemplates ? (
                        <Tabs defaultValue="template" className="w-full" onValueChange={(value) => setDesignSource(value as any)}>
                            <TabsList className='grid w-full grid-cols-2'>
                                <TabsTrigger value="template">Pilih dari Template</TabsTrigger>
                                <TabsTrigger value="upload">Unggah Desain Sendiri</TabsTrigger>
                            </TabsList>
                            <TabsContent value="template">{templateGallery}</TabsContent>
                            <TabsContent value="upload">{uploadArea}</TabsContent>
                        </Tabs>
                    ) : allowUpload ? (
                        <div>
                            <h3 className='text-md mb-3 font-semibold text-gray-800 dark:text-gray-200'>Unggah Desain Anda</h3>
                            {uploadArea}
                        </div>
                    ) : (
                        templateGallery
                    )}
                </div>
            </>
        );
    };

    return (
        <>
            <Head title={product.nama_produk} />
            <Toaster richColors position="top-center" />
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{viewingTemplate?.name}</DialogTitle>
                    </DialogHeader>
                    <div className='mt-4'>
                        <img src={viewingTemplate ? `/storage/${viewingTemplate.thumbnail_path}` : ''} alt={viewingTemplate?.name} className='w-full rounded-lg object-contain' />
                    </div>
                    <Button size="lg" className='mt-4 w-full bg-orange-500 hover:bg-orange-600' onClick={() => handleSelectTemplate(viewingTemplate!)}>
                        Pilih Template Ini
                    </Button>
                </DialogContent>
            </Dialog>
            <div className="bg-gray-50 font-sans text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                <Header auth={auth} />
                <main>
                    <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                        <Breadcrumb className="mb-8">
                            {/* Breadcrumb items */}
                        </Breadcrumb>
                        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-2 lg:gap-16">
                            <div className="sticky top-24">
                                <div className="aspect-square w-full overflow-hidden rounded-xl bg-white shadow-lg">
                                    <img src={product.gambar_url} alt={product.nama_produk} className="h-full w-full object-cover transition-transform duration-300 ease-in-out hover:scale-105" />
                                </div>
                            </div>
                            <div className="flex flex-col gap-y-6">
                                <div>
                                    <p className="font-semibold uppercase tracking-wide text-orange-500">{product.category?.name ?? 'Uncategorized'}</p>
                                    <h1 className="mt-1 text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 sm:text-5xl">{product.nama_produk}</h1>
                                </div>
                                <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-300">{product.deskripsi}</p>
                                {hasAttributes && (
                                    <>
                                        <Separator className='my-4' />
                                        <div className='space-y-6'>
                                            {Object.entries(attributeGroups).map(([name, values]) => (
                                                <div key={name}>
                                                    <h3 className='text-md mb-3 font-semibold text-gray-800 dark:text-gray-200'>{name}</h3>
                                                    <RadioGroup onValueChange={(valueId) => handleOptionChange(values[0].attribute.id.toString(), Number(valueId))} className='flex flex-wrap gap-3'>
                                                        {values.map((value) => (
                                                            <Label key={value.id} htmlFor={value.id.toString()} className='flex cursor-pointer items-center gap-3 rounded-lg border bg-white px-4 py-2 transition-all hover:bg-gray-100 has-[:checked]:border-orange-500 has-[:checked]:bg-orange-50 has-[:checked]:shadow-md dark:bg-gray-800 dark:hover:bg-gray-700'>
                                                                <RadioGroupItem value={value.id.toString()} id={value.id.toString()} />
                                                                {value.value}
                                                                {value.pivot.price > 0 && <span className='text-sm text-gray-500'>(+Rp {value.pivot.price.toLocaleString('id-ID')})</span>}
                                                            </Label>
                                                        ))}
                                                    </RadioGroup>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                                {renderDesignOptions()}
                                <Separator className='my-6' />
                                <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-center gap-4">
                                        <h3 className="text-md font-semibold text-gray-800 dark:text-gray-200">Jumlah</h3>
                                        <div className="flex h-11 items-center rounded-lg border border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-800">
                                            <Button variant="ghost" size="icon" onClick={() => setQuantity(q => Math.max(1, Number(q) - 1))} className="h-full rounded-r-none px-3 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"><Minus className="h-4 w-4" /></Button>
                                            <Input
                                                type="text"
                                                value={quantity}
                                                onChange={handleQuantityChange}
                                                onBlur={handleQuantityBlur}
                                                className="h-full w-16 border-x border-y-0 bg-transparent p-0 text-center text-lg font-bold focus-visible:ring-0 focus-visible:ring-offset-0"
                                            />
                                            <Button variant="ghost" size="icon" onClick={() => setQuantity(q => Number(q) + 1)} className="h-full rounded-l-none px-3 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"><Plus className="h-4 w-4" /></Button>
                                        </div>
                                    </div>
                                    <p className="text-right text-3xl font-bold text-gray-900 dark:text-gray-100">Rp {totalPrice.toLocaleString('id-ID')}</p>
                                </div>
                                <div className="mt-4">
                                    <TooltipProvider delayDuration={100}>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div className="w-full">
                                                    <Button size="lg" onClick={handleAddToCart} disabled={isAddToCartDisabled} className="w-full transform bg-orange-500 py-6 text-lg text-white shadow-lg transition-transform duration-200 hover:scale-105 hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-gray-400">
                                                        <ShoppingCart className="mr-3 h-6 w-6" />
                                                        Tambah ke Keranjang
                                                    </Button>
                                                </div>
                                            </TooltipTrigger>
                                            {isAddToCartDisabled && <TooltipContent><p>{getTooltipMessage()}</p></TooltipContent>}
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
                <Footer isInView={true} />
            </div>
        </>
    );
}
