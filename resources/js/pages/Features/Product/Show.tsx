import { Head } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import { Toaster, toast } from 'sonner'
import { Separator } from '@/components/ui/separator'
import { ShoppingCart, Plus, Minus } from 'lucide-react'
import React, { useState, useMemo } from 'react'
import Header from '@/pages/welcome/partials/Header'
import Footer from '@/pages/welcome/partials/Footer'
import { PageProps as InertiaPageProps } from '@/types'
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'

// Tipe data sesuai dengan brief dari DESIGN.md
interface AttributeValue {
    id: number
    value: string
    attribute: {
        id: number
        name: string
    }
    pivot: {
        price: number
    }
}

interface ProductData {
    id_produk: number
    nama_produk: string
    deskripsi: string
    harga: number
    gambar_url: string
    category: { name: string }
    attribute_values: AttributeValue[]
}

interface PageProps extends InertiaPageProps {
    product: ProductData
}

export default function ProductShowPage({ product, auth }: PageProps) {
    // a. Manajemen State
    const [quantity, setQuantity] = useState(1)
    const [selectedOptions, setSelectedOptions] = useState<Record<string, number>>({})

    // b. Pengelompokan & Rendering Atribut
    const attributeGroups = useMemo(() => {
        return (product.attribute_values || []).reduce(
            (acc, value) => {
                const { name } = value.attribute
                if (!acc[name]) {
                    acc[name] = []
                }
                acc[name].push(value)
                return acc
            },
            {} as Record<string, AttributeValue[]>,
        )
    }, [product.attribute_values])

    const handleOptionChange = (attributeId: string, valueId: number) => {
        setSelectedOptions((prev) => ({
            ...prev,
            [attributeId]: valueId,
        }))
    }

    // c. Logika Harga Dinamis
    const totalPrice = useMemo(() => {
        const attributesPrice = Object.values(selectedOptions).reduce((total, valueId) => {
            const selectedValue = product.attribute_values.find((v) => v.id === valueId)
            return total + (selectedValue ? selectedValue.pivot.price : 0)
        }, 0)
        return (product.harga + attributesPrice) * quantity
    }, [selectedOptions, quantity, product.harga, product.attribute_values])

    // d. Logika Tombol Aksi Kondisional
    const hasAttributes = Object.keys(attributeGroups).length > 0
    const areAllOptionsSelected = hasAttributes
        ? Object.keys(selectedOptions).length === Object.keys(attributeGroups).length
        : true

    const incrementQuantity = () => setQuantity((prev) => prev + 1)
    const decrementQuantity = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1))

    // e. Umpan Balik Notifikasi
    const handleAddToCart = () => {
        toast.success(`${product.nama_produk} berhasil ditambahkan ke keranjang.`, {
            description: `Jumlah: ${quantity} | Total: Rp ${totalPrice.toLocaleString('id-ID')}`,
        })
    }

    return (
        <>
            <Head title={product.nama_produk} />
            <Toaster richColors position='top-center' />
            <div className='bg-gray-50 font-sans text-gray-800 dark:bg-gray-900 dark:text-gray-200'>
                <Header auth={auth} />
                <main>
                    <div className='container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8'>
                        <Breadcrumb className='mb-8'>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbLink href={route('home')}>Home</BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbLink href='#'>Products</BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbPage>{product.nama_produk}</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>

                        <div className='grid grid-cols-1 items-start gap-12 lg:grid-cols-2 lg:gap-16'>
                            <div className='sticky top-24'>
                                <div className='aspect-square w-full overflow-hidden rounded-xl bg-white shadow-lg'>
                                    <img
                                        src={product.gambar_url}
                                        alt={product.nama_produk}
                                        className='h-full w-full object-cover transition-transform duration-300 ease-in-out hover:scale-105'
                                    />
                                </div>
                            </div>

                            <div className='flex flex-col gap-y-6'>
                                <div>
                                    <p className='font-semibold uppercase tracking-wide text-orange-500'>
                                        {product.category?.name ?? 'Uncategorized'}
                                    </p>
                                    <h1 className='mt-1 text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 sm:text-5xl'>
                                        {product.nama_produk}
                                    </h1>
                                </div>

                                <p className='text-lg leading-relaxed text-gray-600 dark:text-gray-300'>{product.deskripsi}</p>

                                {hasAttributes && (
                                    <>
                                        <Separator className='my-4' />
                                        <div className='space-y-6'>
                                            {Object.entries(attributeGroups).map(([name, values]) => (
                                                <div key={name}>
                                                    <h3 className='text-md mb-3 font-semibold text-gray-800 dark:text-gray-200'>
                                                        {name}
                                                    </h3>
                                                    <RadioGroup
                                                        onValueChange={(valueId) =>
                                                            handleOptionChange(values[0].attribute.id.toString(), Number(valueId))
                                                        }
                                                        className='flex flex-wrap gap-3'
                                                    >
                                                        {values.map((value) => (
                                                            <Label
                                                                key={value.id}
                                                                htmlFor={value.id.toString()}
                                                                className='flex cursor-pointer items-center gap-3 rounded-lg border bg-white px-4 py-2 transition-all hover:bg-gray-100 has-[:checked]:border-orange-500 has-[:checked]:bg-orange-50 has-[:checked]:shadow-md dark:bg-gray-800 dark:hover:bg-gray-700'
                                                            >
                                                                <RadioGroupItem value={value.id.toString()} id={value.id.toString()} />
                                                                {value.value}
                                                                {value.pivot.price > 0 && (
                                                                    <span className='text-sm text-gray-500'>
                                                                        (+Rp {value.pivot.price.toLocaleString('id-ID')})
                                                                    </span>
                                                                )}
                                                            </Label>
                                                        ))}
                                                    </RadioGroup>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}

                                <Separator className='my-4' />

                                <div className='flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between'>
                                    <div className='flex items-center gap-4'>
                                        <h3 className='text-md font-semibold text-gray-800 dark:text-gray-200'>Jumlah</h3>
                                        <div className='flex items-center rounded-lg border bg-white dark:border-gray-700 dark:bg-gray-800'>
                                            <Button
                                                variant='ghost'
                                                size='icon'
                                                onClick={decrementQuantity}
                                                className='rounded-r-none transition-colors duration-200 hover:bg-gray-200 dark:hover:bg-gray-700'
                                                disabled={quantity <= 1}
                                            >
                                                <Minus className='h-4 w-4' />
                                            </Button>
                                            <span className='px-6 text-lg font-bold'>{quantity}</span>
                                            <Button
                                                variant='ghost'
                                                size='icon'
                                                onClick={incrementQuantity}
                                                className='rounded-l-none transition-colors duration-200 hover:bg-gray-200 dark:hover:bg-gray-700'
                                            >
                                                <Plus className='h-4 w-4' />
                                            </Button>
                                        </div>
                                    </div>
                                    <p className='text-right text-3xl font-bold text-gray-900 dark:text-gray-100'>
                                        Rp {totalPrice.toLocaleString('id-ID')}
                                    </p>
                                </div>

                                <div className='mt-4'>
                                    <TooltipProvider delayDuration={100}>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div className='w-full'>
                                                    <Button
                                                        size='lg'
                                                        onClick={handleAddToCart}
                                                        disabled={!areAllOptionsSelected}
                                                        className='w-full transform bg-orange-500 py-6 text-lg text-white shadow-lg transition-transform duration-200 hover:scale-105 hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-gray-400'
                                                    >
                                                        <ShoppingCart className='mr-3 h-6 w-6' />
                                                        Tambah ke Keranjang
                                                    </Button>
                                                </div>
                                            </TooltipTrigger>
                                            {!areAllOptionsSelected && (
                                                <TooltipContent>
                                                    <p>Harap pilih semua opsi atribut terlebih dahulu.</p>
                                                </TooltipContent>
                                            )}
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
    )
}
