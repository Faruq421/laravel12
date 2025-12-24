
import { useState, useMemo, useCallback, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import axios from 'axios';
import { cn } from '@/lib/utils';
import { useDropzone } from 'react-dropzone';

// --- UI Components ---
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";
import { ShoppingCart, Plus, Minus, UploadCloud, X, CheckCircle2, Loader2, RefreshCw } from 'lucide-react';

// --- Tipe Data ---
interface ProductData {
    id_produk: number;
    nama_produk: string;
    slug: string;
    deskripsi: string;
    harga: number;
    gambar_url: string;
    attribute_values: AttributeValue[];
    allow_custom_design: boolean;
    design_templates: DesignTemplate[];
    enable_design_feature: boolean;
    category?: { name: string };
}

interface AttributeValue {
    id: number;
    attribute_id: number;
    value: string;
    attribute: { id: number; name: string };
    pivot: { price: number };
}

interface DesignTemplate {
    id: number;
    name: string;
    thumbnail_path: string;
}

type GalleryItem = {
    type: 'image' | 'template';
    thumb: string;
    full: string;
    id: number | string;
};

// --- Props Komponen ---
interface ProductQuickViewProps {
    productSlug?: string | null;
    cartItemId?: string | null;
    isOpen: boolean;
    onClose: () => void;
}

// --- Komponen Galeri Internal ---
const ProductGallery = ({ product, onTemplateSelect, selectedTemplateId }: {
    product: ProductData;
    onTemplateSelect: (index: number) => void;
    selectedTemplateId: number | null;
}) => {
    const [api, setApi] = useState<CarouselApi>();
    const [current, setCurrent] = useState(0);

    const galleryItems: GalleryItem[] = useMemo(() => {
        const items: GalleryItem[] = [{ type: 'image', thumb: product.gambar_url, full: product.gambar_url, id: 'main' }];
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
        <div className="flex flex-col gap-4">
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


// --- Komponen Utama ---
export function ProductQuickView({ productSlug, cartItemId, isOpen, onClose }: ProductQuickViewProps) {
    const [product, setProduct] = useState<ProductData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const isEditMode = !!cartItemId;

    // --- State Manajemen ---
    const [quantity, setQuantity] = useState(1);
    const [selectedOptions, setSelectedOptions] = useState<Record<string, number>>({});
    const [note, setNote] = useState("");
    const [selectedTemplate, setSelectedTemplate] = useState<DesignTemplate | null>(null);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [existingDesign, setExistingDesign] = useState<{ value: string; original_filename: string } | null>(null);

    // Track processing state for button disable
    const [isSubmitting, setIsSubmitting] = useState(false);

    const resetState = useCallback(() => {
        setQuantity(1);
        setSelectedOptions({});
        setNote("");
        setSelectedTemplate(null);
        setUploadedFile(null);
        setExistingDesign(null);
        setPreviewUrl(prev => {
            if (prev) URL.revokeObjectURL(prev);
            return null;
        });
    }, []); // No dependencies - stable function reference

    useEffect(() => {
        if (!isOpen) {
            setProduct(null);
            return;
        }

        setIsLoading(true);
        const url = isEditMode ? `/api/cart/${cartItemId}` : `/api/products/${productSlug}`;

        if (!productSlug && !isEditMode) return;

        axios.get(url)
            .then(response => {
                if (isEditMode) {
                    const { product: productData, selectedOptions: itemOptions } = response.data;
                    setProduct(productData);

                    // Pre-populate state from cart item data
                    setQuantity(itemOptions.quantity || 1);
                    setSelectedOptions(itemOptions.variant || {});
                    setNote(itemOptions.note || "");

                    if (itemOptions.design?.type === 'template' && productData.design_templates) {
                        const foundTemplate = productData.design_templates.find(
                            (t: DesignTemplate) => t.id == itemOptions.design.value
                        );
                        if (foundTemplate) setSelectedTemplate(foundTemplate);
                    } else if (itemOptions.design?.type === 'upload') {
                        setExistingDesign(itemOptions.design);
                    }

                } else {
                    setProduct(response.data);
                    resetState();
                }
            })
            .catch(error => {
                console.error("Gagal memuat data:", error);
                toast.error("Gagal memuat data untuk ditampilkan.");
                onClose();
            })
            .finally(() => setIsLoading(false));
    }, [isOpen, productSlug, cartItemId, isEditMode, onClose]); // Removed resetState to prevent re-fetch on file upload


    // --- Logika Atribut & Harga ---
    const attributeGroups = useMemo(() => {
        if (!product) return {};
        return (product.attribute_values || []).reduce((acc, value) => {
            const { name } = value.attribute;
            if (!acc[name]) acc[name] = [];
            acc[name].push(value);
            return acc;
        }, {} as Record<string, AttributeValue[]>);
    }, [product]);

    const handleOptionChange = (attributeId: string, valueId: number) => {
        setSelectedOptions(prev => ({ ...prev, [attributeId]: valueId }));
    };

    const additionalPrice = useMemo(() => {
        if (!product) return 0;
        return Object.values(selectedOptions).reduce((total, valueId) => {
            const selectedValue = product.attribute_values.find(v => v.id === valueId);
            return total + (selectedValue ? selectedValue.pivot.price : 0);
        }, 0);
    }, [selectedOptions, product]);

    const totalPrice = useMemo(() => {
        if (!product) return 0;
        return (product.harga + additionalPrice) * quantity;
    }, [product, additionalPrice, quantity]);


    // --- Logika Opsi Desain ---
    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (file) {
            setUploadedFile(file);
            setSelectedTemplate(null);
            setExistingDesign(null);
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
        setExistingDesign(null);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
    };

    // --- Logika Tombol Aksi & Tooltip ---
    const hasAttributes = Object.keys(attributeGroups).length > 0;
    const areAllOptionsSelected = hasAttributes ? Object.keys(selectedOptions).length === Object.keys(attributeGroups).length : true;

    const isDesignSelected = !product?.enable_design_feature ||
        !!selectedTemplate ||
        !!uploadedFile ||
        !!existingDesign;

    const isActionDisabled = !areAllOptionsSelected || !isDesignSelected || isSubmitting || !product;

    const getTooltipMessage = () => {
        if (!product) return "Memuat data...";
        if (!areAllOptionsSelected) return "Harap pilih semua varian produk.";
        if (product.enable_design_feature && !isDesignSelected) return "Harap unggah desain atau pilih template.";
        return "";
    };

    const handleAddToCart = () => {
        if (!product) return;

        setIsSubmitting(true);

        // Siapkan data untuk add to cart
        const addData = {
            product_id: product.id_produk,
            quantity: quantity,
            variant: selectedOptions,
            note: note,
            design: null as { type: string; value: number | File } | null,
        };

        // Handle design data
        if (selectedTemplate) {
            addData.design = { type: 'template', value: selectedTemplate.id };
        } else if (uploadedFile) {
            addData.design = { type: 'upload', value: uploadedFile };
        }

        // Use router.post with forceFormData to handle file uploads without page reload
        router.post(route('cart.store'), addData, {
            forceFormData: true,
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                toast.success(`${product.nama_produk} berhasil ditambahkan.`);
                setIsSubmitting(false);
                onClose(); // Tutup modal setelah berhasil
            },
            onError: (errors) => {
                console.error("Cart Add Error:", errors);
                toast.error('Gagal menambahkan produk, periksa kembali pilihan Anda.');
                setIsSubmitting(false);
            },
        });
    };

    const handleUpdateCart = () => {
        if (!cartItemId || !product) return;

        setIsSubmitting(true);

        // Siapkan data untuk update menggunakan router.post dengan method spoofing
        const updateData = {
            _method: 'PATCH' as const, // Method spoofing untuk Laravel
            product_id: product.id_produk,
            quantity: quantity,
            variant: selectedOptions,
            note: note,
            design: null as { type: string; value: number | File | string; original_filename?: string } | null,
        };

        // Handle design data
        if (selectedTemplate) {
            updateData.design = { type: 'template', value: selectedTemplate.id };
        } else if (uploadedFile) {
            updateData.design = { type: 'upload', value: uploadedFile };
        } else if (existingDesign) {
            updateData.design = { type: 'upload', value: existingDesign.value, original_filename: existingDesign.original_filename };
        }

        // Gunakan router.post dengan method spoofing untuk menangani file upload
        router.post(route('cart.update', { cartItemId }), updateData, {
            forceFormData: true,
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                toast.success('Keranjang berhasil diperbarui.');
                setIsSubmitting(false);
                onClose();
            },
            onError: (errors) => {
                console.error("Cart Update Error:", errors);
                toast.error('Gagal memperbarui keranjang.');
                setIsSubmitting(false);
            },
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="sr-only">
                    <DialogTitle>Detail Cepat Produk</DialogTitle>
                    <DialogDescription>Tampilan detail cepat untuk melihat dan mengkonfigurasi produk sebelum ditambahkan ke keranjang.</DialogDescription>
                </DialogHeader>
                {isLoading && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-lg">
                        <Loader2 className="h-12 w-12 animate-spin text-orange-500" />
                    </div>
                )}
                {product && (
                    <>
                        <DialogHeader>
                            {/* Visually hidden title and description for accessibility */}
                            <DialogTitle className="sr-only">{product.nama_produk}</DialogTitle>
                            <DialogDescription className="sr-only">
                                Detail produk dan opsi untuk {product.nama_produk}. Ubah varian, jumlah, dan tambahkan desain kustom sebelum memasukkan ke keranjang.
                            </DialogDescription>
                            <h2 className="text-2xl font-bold">{product.nama_produk}</h2>
                        </DialogHeader>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
                            {/* Kolom Kiri: Galeri */}
                            <ProductGallery product={product} onTemplateSelect={(index) => {
                                const tmpl = product.design_templates[index - 1];
                                if (tmpl) handleSelectTemplate(tmpl);
                            }} selectedTemplateId={selectedTemplate?.id ?? null} />

                            {/* Kolom Kanan: Opsi & Aksi */}
                            <div className="flex flex-col space-y-4">
                                <p className="font-semibold uppercase tracking-wide text-orange-500">{product.category?.name ?? 'Uncategorized'}</p>

                                {/* Opsi Atribut */}
                                {Object.entries(attributeGroups).map(([name, values]) => (
                                    <div key={name}>
                                        <Label className='text-md mb-2 block font-semibold'>{name}</Label>
                                        <RadioGroup onValueChange={(valueId) => handleOptionChange(values[0].attribute.id.toString(), Number(valueId))} value={selectedOptions[values[0].attribute.id]?.toString() || ''} className='flex flex-wrap gap-2'>
                                            {values.map((value) => (
                                                <Label key={value.id} htmlFor={`modal_attr_${value.id}`} className="flex cursor-pointer items-center gap-3 rounded-lg border bg-white px-3 py-2 text-sm transition-all hover:bg-gray-100 has-[:checked]:border-orange-500 has-[:checked]:bg-orange-50">
                                                    <RadioGroupItem value={value.id.toString()} id={`modal_attr_${value.id}`} />
                                                    {value.value}
                                                    {value.pivot.price > 0 && <span className='text-xs text-gray-500'>(+Rp {value.pivot.price.toLocaleString('id-ID')})</span>}
                                                </Label>
                                            ))}
                                        </RadioGroup>
                                    </div>
                                ))}

                                {/* Opsi Desain */}
                                {product.enable_design_feature && (
                                    <div>
                                        <Label className="text-md mb-2 block font-semibold">Opsi Desain</Label>
                                        <Tabs defaultValue={product.design_templates?.length > 0 ? "template" : "upload"} className="w-full">
                                            <TabsList className={cn("grid w-full", product.allow_custom_design && product.design_templates?.length > 0 ? "grid-cols-2" : "grid-cols-1")}>
                                                {product.design_templates?.length > 0 && <TabsTrigger value="template">Pilih Template</TabsTrigger>}
                                                {product.allow_custom_design && <TabsTrigger value="upload">Unggah Desain</TabsTrigger>}
                                            </TabsList>

                                            {product.design_templates?.length > 0 && (
                                                <TabsContent value="template" className="mt-4 p-1">
                                                    <p className="text-sm text-gray-600 mb-3">Pilih salah satu template desain yang tersedia:</p>
                                                    <div className='grid grid-cols-4 gap-3'>
                                                        {product.design_templates.map(template => (
                                                            <div key={template.id} className="relative group">
                                                                <button onClick={() => handleSelectTemplate(template)} className={cn('overflow-hidden rounded-lg aspect-square border-2 transition-all w-full block', selectedTemplate?.id === template.id ? 'border-orange-500 ring-2 ring-orange-300' : 'border-gray-200 hover:border-orange-400')}>
                                                                    <img src={`/storage/${template.thumbnail_path}`} alt={template.name} className='aspect-square w-full object-cover group-hover:scale-110 transition-transform' />
                                                                </button>
                                                                {selectedTemplate?.id === template.id && <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-white border-2 border-white"><CheckCircle2 className="h-4 w-4" /></div>}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </TabsContent>
                                            )}

                                            {product.allow_custom_design && (
                                                <TabsContent value="upload" className="mt-4 p-1">
                                                    {uploadedFile ? (
                                                        <div className='relative w-full rounded-lg border-2 border-dashed border-green-500 bg-green-50 p-4 text-center'>
                                                            <div className="flex items-center gap-3">
                                                                <img src={previewUrl!} alt="Preview" className='h-16 w-16 rounded-md object-cover border' />
                                                                <div className="text-left">
                                                                    <p className='font-semibold text-green-800'>File Terpilih:</p>
                                                                    <p className='truncate text-sm text-gray-700' title={uploadedFile.name}>{uploadedFile.name}</p>
                                                                    <p className="text-xs text-gray-500">{Math.round(uploadedFile.size / 1024)} KB</p>
                                                                </div>
                                                            </div>
                                                            <Button variant="ghost" size="icon" className='absolute top-1 right-1 h-7 w-7 text-gray-500 hover:text-red-600' onClick={removeUploadedFile}><X className='h-5 w-5' /></Button>
                                                        </div>
                                                    ) : existingDesign ? (
                                                        <div className='relative w-full rounded-lg border-2 border-dashed border-blue-500 bg-blue-50 p-4 text-center'>
                                                            <div className="flex items-center gap-3">
                                                                <img src={`/storage/${existingDesign.value}`} alt="Desain saat ini" className='h-16 w-16 rounded-md object-cover border' />
                                                                <div className="text-left">
                                                                    <p className='font-semibold text-blue-800'>Desain Saat Ini:</p>
                                                                    <p className='truncate text-sm text-gray-700' title={existingDesign.original_filename}>{existingDesign.original_filename}</p>
                                                                </div>
                                                            </div>
                                                            <Button variant="ghost" size="icon" className='absolute top-1 right-1 h-7 w-7 text-gray-500 hover:text-red-600' title="Hapus & ganti desain" onClick={() => setExistingDesign(null)}><X className='h-5 w-5' /></Button>
                                                        </div>
                                                    ) : (
                                                        <div {...getRootProps()} className={cn('flex h-40 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors', isDragActive ? 'border-orange-500 bg-orange-50' : 'border-gray-300 hover:border-orange-400 hover:bg-gray-50')}>
                                                            <input {...getInputProps()} />
                                                            <div className="text-center">
                                                                <UploadCloud className='h-10 w-10 text-gray-400 mx-auto' />
                                                                <p className='mt-2 font-semibold text-gray-700'>Seret & lepas file Anda</p>
                                                                <p className="text-xs text-gray-500 mt-1">atau klik untuk memilih file (PNG, JPG, dll)</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </TabsContent>
                                            )}
                                        </Tabs>
                                    </div>
                                )}

                                {/* Kuantitas & Catatan */}
                                <div className="space-y-4 pt-2">
                                    <div>
                                        <Label htmlFor="quantity_modal" className="text-md mb-2 block font-semibold">Jumlah</Label>
                                        <div className="relative flex h-10 w-32 items-center rounded-lg border">
                                            <Button variant="outline" size="icon" onClick={() => setQuantity(q => Math.max(1, q - 1))} className="h-full rounded-r-none"><Minus className="h-4 w-4" /></Button>
                                            <Input id="quantity_modal" type="number" value={quantity} onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} className="h-full w-full border-x border-y-0 bg-transparent p-0 text-center font-bold focus-visible:ring-0 focus-visible:ring-offset-0" />
                                            <Button variant="outline" size="icon" onClick={() => setQuantity(q => q + 1)} className="h-full rounded-l-none"><Plus className="h-4 w-4" /></Button>
                                        </div>
                                    </div>
                                    <div>
                                        <Label htmlFor="note_modal" className="text-md mb-2 block font-semibold">Catatan (Opsional)</Label>
                                        <Textarea id="note_modal" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Tulis catatan untuk pesanan Anda di sini..." className="w-full" rows={2} />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2 border-t pt-4 mt-4">
                            <div className="text-left">
                                <span className="text-sm text-gray-500">Total Harga</span>
                                <p className="text-2xl font-bold">Rp {totalPrice.toLocaleString('id-ID')}</p>
                            </div>
                            <TooltipProvider delayDuration={100}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="w-full sm:w-auto">
                                            <Button size="lg" onClick={isEditMode ? handleUpdateCart : handleAddToCart} disabled={isEditMode ? isSubmitting : isActionDisabled} className="w-full bg-[#FF6500] py-6 text-lg text-white shadow-lg transition-transform duration-200 hover:scale-105 hover:bg-[#FF6500]/90 disabled:cursor-not-allowed disabled:bg-gray-400">
                                                {isEditMode ? <RefreshCw className="mr-3 h-6 w-6" /> : <ShoppingCart className="mr-3 h-6 w-6" />}
                                                {isEditMode ? 'Rubah Pesanan' : 'Tambah ke Keranjang'}
                                            </Button>
                                        </div>
                                    </TooltipTrigger>
                                    {isActionDisabled && <TooltipContent><p>{getTooltipMessage()}</p></TooltipContent>}
                                </Tooltip>
                            </TooltipProvider>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
