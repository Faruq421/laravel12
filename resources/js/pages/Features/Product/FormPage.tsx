import React, { useState, useEffect, useCallback } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { PageProps, BreadcrumbItem } from '@/types';
import { route } from 'ziggy-js';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from "@/components/ui/switch";
import { cn } from '@/lib/utils';
import { UploadCloud, X, PlusCircle, Loader2 } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { toast } from 'sonner';

// --- Tipe Data ---
interface Category { id: number; name: string; }
interface AttributeValue { id: number; value: string; }
interface ExistingAttribute { id: number; name: string; values: AttributeValue[]; }
interface FormOption { value: string; price: number; }
interface FormAttribute { id: string; name: string; options: FormOption[]; }
interface DesignTemplate { id: number; name: string; thumbnail_path: string; }
interface Product {
    id_produk: number; nama_produk: string; deskripsi: string; harga: number; stok: number;
    gambar: string; category_id: number; status: boolean; allow_custom_design: boolean;
    enable_design_feature: boolean;
    attribute_values?: {
        id: number; value: string;
        attribute: { id: number; name: string; };
        pivot: { price: number; };
    }[];
    design_templates?: DesignTemplate[];
}
interface FormPageProps extends PageProps {
    item?: Product;
    categories: Category[];
    allAttributes: ExistingAttribute[];
    designTemplates: DesignTemplate[]; // Ini adalah semua template yg ada di sistem
}

export default function FormPage({ auth, item, categories, allAttributes, designTemplates: allSystemTemplates }: FormPageProps) {

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Products', href: route('products.index') },
        { title: item ? 'Edit' : 'Tambah Baru', href: item ? route('products.edit', item.id_produk) : route('products.create') },
    ];
    const formatAttributesFromBackend = (product?: Product): FormAttribute[] => {
        if (!product?.attribute_values) return [];
        const grouped: { [key: string]: FormOption[] } = {};
        product.attribute_values.forEach(av => {
            const attrName = av.attribute.name;
            if (!grouped[attrName]) {
                grouped[attrName] = [];
            }
            grouped[attrName].push({ value: av.value, price: av.pivot.price });
        });
        return Object.entries(grouped).map(([name, options], index) => ({ id: `existing-${index}`, name, options }));
    };
    const { data, setData, post, processing, errors } = useForm<{
        nama_produk: string; deskripsi: string; harga: number; stok: number; gambar: File | null;
        category_id: number | string; status: boolean; attributes: FormAttribute[];
        allow_custom_design: boolean; enable_design_feature: boolean; design_templates: DesignTemplate[]; _method?: 'PUT';
    }>({
        nama_produk: item?.nama_produk ?? '', deskripsi: item?.deskripsi ?? '', harga: item?.harga ?? 0,
        stok: item?.stok ?? 0, gambar: null, category_id: item?.category_id ?? '', status: item?.status ?? false,
        attributes: formatAttributesFromBackend(item),
        allow_custom_design: item?.allow_custom_design ?? false,
        enable_design_feature: item?.enable_design_feature ?? false,
        design_templates: item?.design_templates ?? [],
    });

    // --- State & Logic untuk Gambar Produk ---
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    useEffect(() => {
        if (data.gambar) {
            const url = URL.createObjectURL(data.gambar);
            setPreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        }
    }, [data.gambar]);

    // --- State & Logic untuk Atribut ---
    const [currentOptions, setCurrentOptions] = useState<{ [key: string]: string }>({});
    const addAttribute = () => { setData('attributes', [...data.attributes, { id: `new-${Date.now()}`, name: '', options: [] }]); };
    const removeAttribute = (id: string) => { setData('attributes', data.attributes.filter(attr => attr.id !== id)); };
    const handleAttributeNameChange = (id: string, value: string) => { setData('attributes', data.attributes.map(attr => attr.id === id ? { ...attr, name: value } : attr)); };
    const handleOptionInputChange = (attributeId: string, value: string) => { setCurrentOptions({ ...currentOptions, [attributeId]: value }); };
    const addOption = (attributeId: string) => {
        const newOptionValue = currentOptions[attributeId]?.trim();
        if (!newOptionValue) return;
        setData('attributes', data.attributes.map(attr => {
            if (attr.id === attributeId && !attr.options.some(o => o.value === newOptionValue)) {
                return { ...attr, options: [...attr.options, { value: newOptionValue, price: 0 }] };
            }
            return attr;
        }));
        setCurrentOptions({ ...currentOptions, [attributeId]: '' });
    };
    const removeOption = (attributeId: string, optionValueToRemove: string) => {
        setData('attributes', data.attributes.map(attr => {
            if (attr.id === attributeId) {
                return { ...attr, options: attr.options.filter(opt => opt.value !== optionValueToRemove) };
            }
            return attr;
        }));
    };
    const handleOptionPriceChange = (attributeId: string, optionValue: string, newPrice: number) => {
        setData('attributes', data.attributes.map(attr => {
            if (attr.id === attributeId) {
                return { ...attr, options: attr.options.map(opt => opt.value === optionValue ? { ...opt, price: newPrice } : opt) };
            }
            return attr;
        }));
    };

    // --- State & Logic untuk Template Desain ---
    const [isUploading, setIsUploading] = useState(false);

    const handleDrop = useCallback((acceptedFiles: File[]) => {
        setIsUploading(true);
        const uploadPromises = acceptedFiles.map(file => {
            const formData = new FormData();
            formData.append('file', file);
            return axios.post(route('design-templates.upload'), formData);
        });

        Promise.all(uploadPromises)
            .then(responses => {
                const newTemplates = responses.map(res => res.data);
                setData('design_templates', [...data.design_templates, ...newTemplates]);
                toast.success(`${newTemplates.length} template berhasil diunggah.`);
            })
            .catch(error => {
                console.error("Upload error:", error);
                toast.error("Gagal mengunggah template.", { description: error.response?.data?.message || error.message });
            })
            .finally(() => {
                setIsUploading(false);
            });
    }, [data.design_templates, setData]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: handleDrop,
        accept: { 'image/*': ['.jpeg', '.png', '.jpg', '.gif', '.svg'] },
        disabled: isUploading,
    });

    const unlinkTemplate = (templateId: number) => {
        setData('design_templates', data.design_templates.filter(t => t.id !== templateId));
    };

    // --- Submit Handler ---
    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const url = item ? route('products.update', item.id_produk) : route('products.store');
        post(url, { forceFormData: true });
    }
    if (item && !data._method) { setData('_method', 'PUT'); }

    const imageSource = previewUrl || (item?.gambar ? `/storage/${item.gambar}` : null);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={(item ? 'Edit' : 'Tambah') + ' Produk'} />
            <div className="p-4 sm:p-6 lg:p-8">
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Kolom Kiri */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Card Detail Produk */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Detail Produk</CardTitle>
                                    <CardDescription>Isi nama, kategori, dan deskripsi produk Anda.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="nama_produk">Nama Produk</Label>
                                        <Input id="nama_produk" value={data.nama_produk} onChange={e => setData('nama_produk', e.target.value)} placeholder="Contoh: Cetak Banner Premium" />
                                        {errors.nama_produk && <p className="text-sm text-red-500 mt-1">{errors.nama_produk}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="category_id">Kategori Produk</Label>
                                        <Select value={data.category_id?.toString()} onValueChange={(value) => setData('category_id', value)}>
                                            <SelectTrigger><SelectValue placeholder="Pilih kategori" /></SelectTrigger>
                                            <SelectContent>
                                                {categories.map((category) => (
                                                    <SelectItem key={category.id} value={category.id.toString()}>{category.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.category_id && <p className="text-sm text-red-500 mt-1">{errors.category_id}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="deskripsi">Deskripsi</Label>
                                        <Textarea id="deskripsi" value={data.deskripsi} onChange={e => setData('deskripsi', e.target.value)} placeholder="Jelaskan detail produk, bahan, ukuran, dll." rows={8} />
                                        {errors.deskripsi && <p className="text-sm text-red-500 mt-1">{errors.deskripsi}</p>}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Card Varian Produk */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Varian Produk (Atribut)</CardTitle>
                                    <CardDescription>Pilih varian, buat yang baru, dan atur harganya.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {data.attributes.map((attribute) => {
                                        const existingAttr = allAttributes.find(a => a.name === attribute.name);
                                        const valueSuggestions = existingAttr ? existingAttr.values : [];
                                        return (
                                            <div key={attribute.id} className="p-4 border rounded-lg space-y-4 relative bg-gray-50/50 dark:bg-gray-900/50">
                                                <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7 text-gray-500 hover:text-red-500" onClick={() => removeAttribute(attribute.id)}>
                                                    <X className="h-4 w-4" />
                                                </Button>
                                                <div className="space-y-2">
                                                    <Label>Nama Varian (Contoh: Ukuran)</Label>
                                                    <Input list="attributes-list" value={attribute.name} onChange={(e) => handleAttributeNameChange(attribute.id, e.target.value)} placeholder="Pilih atau ketik baru" className="bg-white dark:bg-gray-800" />
                                                    <datalist id="attributes-list">{allAttributes.map(attr => <option key={attr.id} value={attr.name} />)}</datalist>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Pilihan Varian (Contoh: S, M, L)</Label>
                                                    <div className="flex gap-2">
                                                        <Input
                                                            list={`values-list-${attribute.id}`}
                                                            value={currentOptions[attribute.id] || ''}
                                                            onChange={(e) => handleOptionInputChange(attribute.id, e.target.value)}
                                                            placeholder="Pilih atau ketik baru"
                                                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addOption(attribute.id); } }}
                                                            className="bg-white dark:bg-gray-800"
                                                        />
                                                        {valueSuggestions.length > 0 && (
                                                            <datalist id={`values-list-${attribute.id}`}>
                                                                {valueSuggestions.map(val => <option key={val.id} value={val.value} />)}
                                                            </datalist>
                                                        )}
                                                        <Button type="button" onClick={() => addOption(attribute.id)}>Tambah</Button>
                                                    </div>
                                                </div>
                                                {attribute.options.length > 0 && (
                                                    <div className="space-y-3 pt-3 border-t border-dashed mt-4">
                                                        {attribute.options.map(option => (
                                                            <div key={option.value} className="flex items-center justify-between gap-3 p-2 rounded-md bg-gray-100 dark:bg-gray-800">
                                                                <div className="flex items-center gap-2">
                                                                    <button type="button" onClick={() => removeOption(attribute.id, option.value)} className="text-gray-500 hover:text-red-500"><X className="h-3.5 w-3.5" /></button>
                                                                    <span className="text-sm font-medium">{option.value}</span>
                                                                </div>
                                                                <div className="relative">
                                                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-sm text-gray-500">Rp</span>
                                                                    <Input type="number" value={option.price} onChange={(e) => handleOptionPriceChange(attribute.id, option.value, parseInt(e.target.value, 10) || 0)} placeholder="Harga" className="h-8 w-32 pl-8 pr-2 text-right" />
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                    <Button type="button" variant="outline" className="w-full flex items-center gap-2" onClick={addAttribute}>
                                        <PlusCircle className="h-4 w-4" /> Tambah Varian Baru
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Kolom Kanan */}
                        <div className="space-y-8">
                            <Card>
                                <CardHeader><CardTitle>Status Publikasi</CardTitle></CardHeader>
                                <CardContent>
                                    <div className="flex items-center space-x-2">
                                        <Switch id="status" checked={data.status} onCheckedChange={(checked) => setData('status', checked)} />
                                        <Label htmlFor="status">{data.status ? 'Published' : 'Draft'}</Label>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-2">Aktifkan untuk menampilkan produk.</p>
                                    {errors.status && <p className="text-sm text-red-500 mt-1">{errors.status}</p>}
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader><CardTitle>Gambar Produk</CardTitle></CardHeader>
                                <CardContent>
                                    <label htmlFor="gambar" className="cursor-pointer">
                                        <div className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                                            {imageSource ? (
                                                <img src={imageSource} alt="Pratinjau" className="h-full w-full rounded-md object-cover" onError={(e) => { e.currentTarget.src = 'https://placehold.co/200x200/e2e8f0/adb5bd?text=Error'; }} />
                                            ) : (
                                                <div className="text-center text-gray-500">
                                                    <UploadCloud className="mx-auto h-12 w-12" />
                                                    <p className="mt-2 text-sm">Klik untuk mengunggah</p>
                                                    <p className="text-xs">PNG, JPG (MAX. 2MB)</p>
                                                </div>
                                            )}
                                        </div>
                                    </label>
                                    <Input id="gambar" type="file" onChange={e => setData('gambar', e.target.files ? e.target.files[0] : null)} className="hidden" />
                                    {errors.gambar && <p className="text-sm text-red-500 mt-2">{errors.gambar}</p>}
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader><CardTitle>Harga & Stok</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="harga">Harga</Label>
                                        <Input id="harga" type="number" value={data.harga} onChange={e => setData('harga', parseInt(e.target.value, 10) || 0)} placeholder="75000" />
                                        {errors.harga && <p className="text-sm text-red-500 mt-1">{errors.harga}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="stok">Stok</Label>
                                        <Input id="stok" type="number" value={data.stok} onChange={e => setData('stok', parseInt(e.target.value, 10) || 0)} placeholder="100" />
                                        {errors.stok && <p className="text-sm text-red-500 mt-1">{errors.stok}</p>}
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Opsi Desain</CardTitle>
                                    <CardDescription>Atur bagaimana pelanggan dapat menyediakan desain.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="flex items-center space-x-2 p-4 border rounded-lg bg-yellow-50/50 dark:bg-yellow-900/10">
                                        <Switch id="enable_design_feature" checked={data.enable_design_feature} onCheckedChange={(checked) => setData('enable_design_feature', checked)} />
                                        <Label htmlFor="enable_design_feature">Aktifkan Fitur Desain Untuk Produk Ini</Label>
                                    </div>

                                    {data.enable_design_feature && (
                                        <div className="space-y-6 pt-6 border-t border-dashed">
                                            <div className="flex items-center space-x-2 p-4 border rounded-lg">
                                                <Switch id="allow_custom_design" checked={data.allow_custom_design} onCheckedChange={(checked) => setData('allow_custom_design', checked)} />
                                                <Label htmlFor="allow_custom_design">Izinkan Pelanggan Unggah Desain Sendiri</Label>
                                            </div>
                                            <div>
                                                <Label>Template Desain</Label>
                                                <p className="text-sm text-gray-500 mb-3">Seret & lepas gambar untuk diunggah sebagai template baru untuk produk ini.</p>
                                                <div {...getRootProps()} className={cn("flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800", isDragActive ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-gray-300 dark:border-gray-600")}>
                                                    <input {...getInputProps()} />
                                                    {isUploading ? (
                                                        <div className="text-center text-gray-500">
                                                            <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                                                            <p className="mt-2 text-sm">Mengunggah...</p>
                                                        </div>
                                                    ) : isDragActive ? (
                                                        <p className="text-center text-blue-500">Lepaskan file di sini...</p>
                                                    ) : (
                                                        <div className="text-center text-gray-500">
                                                            <UploadCloud className="mx-auto h-8 w-8" />
                                                            <p className="mt-2 text-sm">Seret & lepas atau klik untuk memilih file</p>
                                                        </div>
                                                    )}
                                                </div>
                                                {data.design_templates.length > 0 && (
                                                    <div className="mt-4 space-y-2">
                                                        <Label>Template Tertaut</Label>
                                                        <div className="grid grid-cols-3 gap-4">
                                                            {data.design_templates.map(template => (
                                                                <div key={template.id} className="relative group">
                                                                    <img src={`/storage/${template.thumbnail_path}`} alt={template.name} className="w-full h-24 object-cover rounded-md" />
                                                                    <button type="button" onClick={() => unlinkTemplate(template.id)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                        <X className="h-3 w-3" />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-8">
                        <Link href={route('products.index')} className={cn(buttonVariants({ variant: 'ghost' }))}>Batal</Link>
                        <Button type="submit" disabled={processing}>{item ? 'Perbarui Produk' : 'Simpan Produk'}</Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

