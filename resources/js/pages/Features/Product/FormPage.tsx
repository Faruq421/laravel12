import React, { useState, useEffect } from 'react';
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
import { UploadCloud, X, PlusCircle } from 'lucide-react';

// --- Tipe Data Diperbarui untuk menyertakan Harga ---
interface Category { id: number; name: string; }
interface AttributeValue { id: number; value: string; }
interface ExistingAttribute { id: number; name: string; values: AttributeValue[]; }

// Opsi di state sekarang adalah objek dengan value dan price
interface FormOption {
    value: string;
    price: number;
}

interface FormAttribute {
    id: string; // ID unik sementara untuk rendering
    name: string;
    options: FormOption[];
}

interface Product {
    id_produk: number;
    nama_produk: string;
    deskripsi: string;
    harga: number;
    stok: number;
    gambar: string;
    category_id: number;
    status: boolean;
    attribute_values?: {
        id: number;
        value: string;
        attribute: { id: number; name: string; };
        pivot: { price: number; }; // Data dari tabel pivot sekarang ada di sini
    }[];
}

interface FormPageProps extends PageProps {
    item?: Product;
    categories: Category[];
    allAttributes: ExistingAttribute[];
}

export default function FormPage({ auth, item, categories, allAttributes }: FormPageProps) {

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
            grouped[attrName].push({
                value: av.value,
                price: av.pivot.price // Ambil harga dari pivot
            });
        });
        return Object.entries(grouped).map(([name, options], index) => ({
            id: `existing-${index}`, name, options,
        }));
    };

    const { data, setData, post, processing, errors } = useForm<{
        nama_produk: string; deskripsi: string; harga: number; stok: number; gambar: File | null;
        category_id: number | string; status: boolean; attributes: FormAttribute[]; _method?: 'PUT';
    }>({
        nama_produk: item?.nama_produk ?? '',
        deskripsi: item?.deskripsi ?? '',
        harga: item?.harga ?? 0,
        stok: item?.stok ?? 0,
        gambar: null,
        category_id: item?.category_id ?? '',
        status: item?.status ?? false,
        attributes: formatAttributesFromBackend(item),
    });

    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [currentOptions, setCurrentOptions] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        if (data.gambar) {
            const url = URL.createObjectURL(data.gambar);
            setPreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        }
    }, [data.gambar]);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const url = item ? route('products.update', item.id_produk) : route('products.store');
        post(url, { forceFormData: true });
    }

    if (item && !data._method) {
        setData('_method', 'PUT');
    }

    // --- FUNGSI-FUNGSI LOGIKA ATRIBUT (Diperbarui dengan Harga) ---
    const addAttribute = () => { setData('attributes', [...data.attributes, { id: `new-${Date.now()}`, name: '', options: [] }]); };
    const removeAttribute = (id: string) => { setData('attributes', data.attributes.filter(attr => attr.id !== id)); };
    const handleAttributeNameChange = (id: string, value: string) => { setData('attributes', data.attributes.map(attr => attr.id === id ? { ...attr, name: value } : attr)); };
    const handleOptionInputChange = (attributeId: string, value: string) => { setCurrentOptions({ ...currentOptions, [attributeId]: value }); };

    const addOption = (attributeId: string) => {
        const newOptionValue = currentOptions[attributeId]?.trim();
        if (!newOptionValue) return;

        setData('attributes', data.attributes.map(attr => {
            if (attr.id === attributeId && !attr.options.some(o => o.value === newOptionValue)) {
                // Tambahkan opsi baru sebagai objek dengan harga default 0
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

    // Fungsi baru untuk mengubah harga opsi
    const handleOptionPriceChange = (attributeId: string, optionValue: string, newPrice: number) => {
        setData('attributes', data.attributes.map(attr => {
            if (attr.id === attributeId) {
                return {
                    ...attr,
                    options: attr.options.map(opt =>
                        opt.value === optionValue ? { ...opt, price: newPrice } : opt
                    )
                };
            }
            return attr;
        }));
    };

    const imageSource = previewUrl || (item?.gambar ? `/storage/${item.gambar}` : null);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={(item ? 'Edit' : 'Tambah') + ' Produk'} />
            <div className="p-4 sm:p-6 lg:p-8">
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Kolom Kiri */}
                        <div className="lg:col-span-2 space-y-8">
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

                            <Card>
                                <CardHeader>
                                    <CardTitle>Varian Produk (Atribut)</CardTitle>
                                    <CardDescription>Pilih varian, buat yang baru, dan atur harganya.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {data.attributes.map((attribute) => (
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
                                                    <Input value={currentOptions[attribute.id] || ''} onChange={(e) => handleOptionInputChange(attribute.id, e.target.value)} placeholder="Ketik lalu tekan 'Tambah'" onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addOption(attribute.id); } }} className="bg-white dark:bg-gray-800" />
                                                    <Button type="button" onClick={() => addOption(attribute.id)}>Tambah</Button>
                                                </div>
                                            </div>

                                            {/* Container untuk tag/pil dengan input harga */}
                                            {attribute.options.length > 0 && (
                                                <div className="space-y-3 pt-3 border-t border-dashed mt-4">
                                                    {attribute.options.map(option => (
                                                        <div key={option.value} className="flex items-center justify-between gap-3 p-2 rounded-md bg-gray-100 dark:bg-gray-800">
                                                            <div className="flex items-center gap-2">
                                                                <button type="button" onClick={() => removeOption(attribute.id, option.value)} className="text-gray-500 hover:text-red-500">
                                                                    <X className="h-3.5 w-3.5" />
                                                                </button>
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
                                    ))}
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

