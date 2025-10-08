import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetClose } from '@/components/ui/sheet';
import { usePage, Link, router } from '@inertiajs/react';
import { ShoppingCart, Trash2, Plus, Minus, Pencil, PackageOpen } from 'lucide-react';
import { PageProps } from '@/types';
import { useMemo, useState } from 'react';
import { debounce } from 'lodash';
import { ProductQuickView } from './ProductQuickView'; // Import Quick View

// Tipe data dari backend
interface CartItem {
    id: string;
    product_id: number;
    name: string;
    quantity: number;
    price: number;
    variant: string[];
    image: string;
}

interface CartData {
    items: Record<string, CartItem>;
    subtotal: number;
}

// --- Komponen Internal ---

// Kartu untuk setiap item di keranjang
const CartItemCard = ({ item, onEdit }: { item: CartItem; onEdit: (itemId: string) => void; }) => {
    const [quantity, setQuantity] = useState(item.quantity);

    const debouncedUpdate = useMemo(
        () =>
            debounce((newQuantity: number) => {
                router.patch(route('cart.update', item.id), {
                    quantity: newQuantity,
                }, {
                    preserveState: true,
                    preserveScroll: true,
                });
            }, 300),
        [item.id]
    );

    const handleQuantityChange = (newQuantity: number) => {
        if (newQuantity >= 1) {
            setQuantity(newQuantity);
            debouncedUpdate(newQuantity);
        }
    };

    const removeItem = () => {
        router.delete(route('cart.destroy', item.id), {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <div className="flex items-start gap-4 rounded-lg p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50">
            <img src={item.image} alt={item.name} className="h-24 w-24 rounded-md object-cover border" />
            <div className="flex-1">
                <p className="font-semibold text-md">{item.name}</p>
                {item.variant && item.variant.length > 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">{item.variant.join(', ')}</p>
                )}
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-1">
                    Rp {item.price.toLocaleString('id-ID')}
                </p>
                <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                        <Button variant="outline" size="icon" onClick={() => handleQuantityChange(quantity - 1)} className="h-8 w-8">
                            <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-10 text-center font-bold">{quantity}</span>
                        <Button variant="outline" size="icon" onClick={() => handleQuantityChange(quantity + 1)} className="h-8 w-8">
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="flex items-center gap-1">
                         <Button variant="ghost" size="icon" onClick={() => onEdit(item.id)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={removeItem} className="text-red-500 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Tampilan saat keranjang kosong
const EmptyCart = () => (
    <div className="flex h-full flex-col items-center justify-center text-center">
        <PackageOpen className="h-28 w-28 text-gray-300 dark:text-gray-600" />
        <p className="mt-6 text-xl font-semibold">Keranjang Anda Kosong</p>
        <p className="mt-2 text-gray-500 dark:text-gray-400">Waktunya berburu produk keren!</p>
        <SheetClose asChild>
            <Button className="mt-8 bg-[#FF6500] text-white hover:bg-[#FF6500]/90">
                Mulai Belanja
            </Button>
        </SheetClose>
    </div>
);


// --- Komponen Utama ---

export function CartSheet() {
    const { props } = usePage<PageProps>();
    const cart = (props.cart as CartData | null) || { items: {}, subtotal: 0 };
    const cartItems = Object.values(cart.items || {});

    // State untuk mengelola modal Quick View
    const [isQuickViewOpen, setQuickViewOpen] = useState(false);
    const [editingCartItemId, setEditingCartItemId] = useState<string | null>(null);

    const handleOpenEdit = (cartItemId: string) => {
        setEditingCartItemId(cartItemId);
        setQuickViewOpen(true);
    };

    const totalItems = useMemo(() => {
        return cartItems.reduce((acc, item) => acc + item.quantity, 0);
    }, [cartItems]);

    return (
        <>
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="relative rounded-full h-10 w-10">
                        <ShoppingCart className="h-5 w-5" />
                        {totalItems > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white">
                                {totalItems}
                            </span>
                        )}
                    </Button>
                </SheetTrigger>
                <SheetContent className="flex w-full flex-col bg-white dark:bg-gray-900 sm:max-w-lg">
                    <SheetHeader className="border-b pb-4 dark:border-gray-700">
                        <SheetTitle className="text-xl font-bold">Keranjang Belanja</SheetTitle>
                    </SheetHeader>

                    {cartItems.length > 0 ? (
                        <>
                            <div className="flex-1 overflow-y-auto -mx-6 px-6 my-4">
                                <div className="space-y-4">
                                    {cartItems.map((item) => (
                                        <CartItemCard key={item.id} item={item} onEdit={handleOpenEdit} />
                                    ))}
                                </div>
                            </div>

                            <SheetFooter className="mt-auto border-t pt-6 dark:border-gray-700">
                                <div className="w-full space-y-4">
                                    <div className="flex justify-between text-lg font-semibold">
                                        <span>Subtotal</span>
                                        <span>Rp {cart.subtotal.toLocaleString('id-ID')}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Biaya pengiriman dan pajak akan dihitung saat checkout.
                                    </p>
                                    <div className="grid grid-cols-1 gap-3">
                                        <Button asChild size="lg" className="bg-[#FF6500] text-white hover:bg-[#FF6500]/90 text-lg h-12">
                                            <Link href="#">Checkout</Link>
                                        </Button>
                                        <SheetClose asChild>
                                            <Button asChild variant="outline" size="lg" className="text-lg h-12">
                                                <Link href="/">Lanjutkan Belanja</Link>
                                            </Button>
                                        </SheetClose>
                                    </div>
                                </div>
                            </SheetFooter>
                        </>
                    ) : (
                        <EmptyCart />
                    )}
                </SheetContent>
            </Sheet>

            {/* Render modal Quick View untuk mode edit */}
            {editingCartItemId && (
                <ProductQuickView
                    cartItemId={editingCartItemId}
                    isOpen={isQuickViewOpen}
                    onClose={() => {
                        setQuickViewOpen(false);
                        setEditingCartItemId(null);
                    }}
                />
            )}
        </>
    );
}