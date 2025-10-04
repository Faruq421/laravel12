import { Head } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import { Toaster, toast } from 'sonner'
import { Separator } from '@/components/ui/separator'
import { ShoppingCart, Plus, Minus, CheckCircle } from 'lucide-react'
import React, { useState, useMemo } from 'react'
import Header from '@/pages/welcome/partials/Header'
import Footer from '@/pages/welcome/partials/Footer'
import { PageProps as InertiaPageProps } from '@/types'
import { cn } from '@/lib/utils'

// Definisikan tipe data yang lebih detail untuk props
interface Attribute {
    id: number
    name: string
}

interface AttributeValue {
    id: number
    value: string
    price: number // Harga tambahan untuk atribut ini
    attribute: Attribute
}

interface Category {
    id: number
    name: string
}

interface Product {
    id_produk: number
    nama_produk: string
    deskripsi: string
    harga: number // Harga dasar produk
    gambar_url: string
    category: Category
    attributeValues: AttributeValue[]
}

interface PageProps extends InertiaPageProps {
    product: Product
}

// Komponen untuk menampilkan grup atribut
const AttributeSelector: React.FC<{
    attributes: Record<string, AttributeValue[]>
    selectedAttributes: Record<string, number>
    onAttributeChange: (attributeId: string, valueId: number) => void
}> = ({ attributes, selectedAttributes, onAttributeChange }) => (
    <div className="space-y-6">
        {Object.entries(attributes).map(([attributeName, values]) => (
            <div key={attributeName}>
                <h3 className="text-md font-semibold text-gray-800 mb-3">{attributeName}</h3>
                <div className="flex flex-wrap gap-3">
                    {values.map(value => {
                        const isSelected = selectedAttributes[value.attribute.id] === value.id
                        return (
                            <Button
                                key={value.id}
                                variant={isSelected ? 'default' : 'outline'}
                                onClick={() => onAttributeChange(String(value.attribute.id), value.id)}
                                className={cn(
                                    'transition-all duration-200 ease-in-out transform hover:scale-105',
                                    isSelected && 'bg-[#FF6500] hover:bg-[#e05a00] text-white shadow-md',
                                )}
                            >
                                {isSelected && <CheckCircle className="w-4 h-4 mr-2" />}
                                {value.value}
                            </Button>
                        )
                    })}
                </div>
            </div>
        ))}
    </div>
)

export default function ProductShowPage({ product, auth }: PageProps) {
    const [quantity, setQuantity] = useState(1)
    const [selectedAttributes, setSelectedAttributes] = useState<Record<string, number>>({})

    // Mengelompokkan attributeValues berdasarkan nama atribut
    const attributes = useMemo(() => {
        // PERBAIKAN: Tambahkan fallback ke array kosong untuk mencegah error jika attributeValues null
        return (product.attributeValues || []).reduce(
            (acc, value) => {
                const key = value.attribute.name
                if (!acc[key]) {
                    acc[key] = []
                }
                acc[key].push(value)
                return acc
            },
            {} as Record<string, AttributeValue[]>,
        )
    }, [product.attributeValues])

    const handleAttributeChange = (attributeId: string, valueId: number) => {
        setSelectedAttributes(prev => ({
            ...prev,
            [attributeId]: valueId,
        }))
    }

    // Kalkulasi harga total berdasarkan harga dasar, atribut terpilih, dan kuantitas
    const totalPrice = useMemo(() => {
        const attributesPrice = Object.values(selectedAttributes).reduce((total, valueId) => {
            const selectedValue = product.attributeValues.find(v => v.id === valueId)
            return total + (selectedValue ? selectedValue.price : 0)
        }, 0)
        return (product.harga + attributesPrice) * quantity
    }, [selectedAttributes, quantity, product.harga, product.attributeValues])

    const incrementQuantity = () => setQuantity(prev => prev + 1)
    const decrementQuantity = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1))

    const handleAddToCart = () => {
        // Logika untuk menambahkan ke keranjang akan ditambahkan di sini
        // Contoh: router.post('/cart', { productId: product.id_produk, quantity, attributes: selectedAttributes });

        toast.success(`${product.nama_produk} berhasil ditambahkan ke keranjang.`)
    }

    return (
        <>
            <Head title={product.nama_produk} />
            <Toaster richColors />
            <div className="bg-gray-50 text-gray-800 font-sans">
                <Header auth={auth} />
                <main>
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                            {/* Kolom Kiri: Gambar Produk */}
                            <div className="p-4 bg-white rounded-2xl shadow-lg">
                                <div className="aspect-square w-full overflow-hidden rounded-xl">
                                    <img
                                        src={product.gambar_url}
                                        alt={product.nama_produk}
                                        className="w-full h-full object-cover transition-transform duration-300 ease-in-out hover:scale-105"
                                    />
                                </div>
                            </div>

                            {/* Kolom Kanan: Informasi & Aksi */}
                            <div className="flex flex-col gap-6">
                                <div>
                                    <p className="text-md font-semibold text-[#FF6500] uppercase tracking-wide">
                                        {product.category?.name}
                                    </p>
                                    <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mt-2">
                                        {product.nama_produk}
                                    </h1>
                                </div>

                                <p className="text-gray-600 leading-relaxed text-lg">{product.deskripsi}</p>

                                <Separator />

                                {/* Selektor Atribut */}
                                <AttributeSelector
                                    attributes={attributes}
                                    selectedAttributes={selectedAttributes}
                                    onAttributeChange={handleAttributeChange}
                                />

                                <Separator />

                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                                    {/* Kuantitas */}
                                    <div className="flex items-center gap-4">
                                        <h3 className="text-md font-semibold text-gray-800">Jumlah</h3>
                                        <div className="flex items-center border rounded-lg">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={decrementQuantity}
                                                className="rounded-r-none transition-colors duration-200 hover:bg-gray-200"
                                            >
                                                <Minus className="h-4 w-4" />
                                            </Button>
                                            <span className="px-6 text-lg font-bold">{quantity}</span>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={incrementQuantity}
                                                className="rounded-l-none transition-colors duration-200 hover:bg-gray-200"
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    {/* Harga Total */}
                                    <p className="text-3xl font-bold text-gray-900 text-right">
                                        Rp {totalPrice.toLocaleString('id-ID')}
                                    </p>
                                </div>

                                {/* Tombol Aksi */}
                                <div className="mt-4">
                                    <Button
                                        size="lg"
                                        onClick={handleAddToCart}
                                        className="bg-[#FF6500] hover:bg-[#e05a00] text-white text-lg w-full py-6 shadow-lg transform transition-transform duration-200 hover:scale-105"
                                    >
                                        <ShoppingCart className="mr-3 h-6 w-6" />
                                        Tambah ke Keranjang
                                    </Button>
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
