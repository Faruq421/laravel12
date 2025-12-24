import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetClose } from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';
import { usePage, Link, router } from '@inertiajs/react';
import { ShoppingCart, Trash2, Pencil, PackageOpen } from 'lucide-react';
import { PageProps } from '@/types';
import { useMemo, useState, useEffect } from 'react';
import { ProductQuickView } from './ProductQuickView';
import { Label } from '@/components/ui/label';

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

const CartItemCard = ({
    item,
    onEdit,
    isSelected,
    onSelect,
}: {
    item: CartItem;
    onEdit: (itemId: string) => void;
    isSelected: boolean;
    onSelect: (itemId: string) => void;
}) => {
    const removeItem = () => {
        router.delete(route('cart.destroy', item.id), {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <div className="flex items-center gap-4 py-4">
            <Checkbox
                id={`item-${item.id}`}
                checked={isSelected}
                onCheckedChange={() => onSelect(item.id)}
                className="h-5 w-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500 data-[state=checked]:bg-orange-500 data-[state=checked]:text-white"
            />
            <img src={item.image} alt={item.name} className="h-24 w-24 rounded-lg object-cover border" />
            <div className="flex flex-col justify-between flex-1 h-24">
                <div>
                    <p className="font-semibold text-md leading-tight">{item.name}</p>
                    {item.variant && item.variant.length > 0 && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.variant.join(' / ')}</p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400">Qty: {item.quantity}</p>
                </div>
                <div className="flex items-center justify-between mt-2">
                    <p className="text-md font-bold text-gray-800 dark:text-gray-200">
                        Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                    </p>
                    <div className="flex items-center">
                        <Button variant="ghost" size="icon" onClick={() => onEdit(item.id)} className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-300 h-8 w-8">
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={removeItem} className="text-red-500 hover:text-red-700 h-8 w-8">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

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

export function CartSheet() {
    const { props } = usePage<PageProps>();
    const cart = (props.cart as CartData | null) || { items: {}, subtotal: 0 };
    const cartItems = Object.values(cart.items || {});

    const [isQuickViewOpen, setQuickViewOpen] = useState(false);
    const [editingCartItemId, setEditingCartItemId] = useState<string | null>(null);
    const [selectedItems, setSelectedItems] = useState<string[]>([]);

    useEffect(() => {
        // Saat keranjang berubah, pilih semua item secara default
        setSelectedItems(cartItems.map(item => item.id));
    }, [cart]);

    const handleSelectItem = (itemId: string) => {
        setSelectedItems(prev =>
            prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
        );
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedItems(cartItems.map(item => item.id));
        } else {
            setSelectedItems([]);
        }
    };

    const handleOpenEdit = (cartItemId: string) => {
        setEditingCartItemId(cartItemId);
        setQuickViewOpen(true);
    };

    const totalItems = useMemo(() => cartItems.length, [cartItems]);
    const isAllSelected = useMemo(() => totalItems > 0 && selectedItems.length === totalItems, [selectedItems, totalItems]);

    const selectedSubtotal = useMemo(() => {
        return cartItems
            .filter(item => selectedItems.includes(item.id))
            .reduce((total, item) => total + item.price * item.quantity, 0);
    }, [selectedItems, cartItems]);

    const handleCheckout = () => {
        if (selectedItems.length > 0) {
            router.get(route('checkout.create'), {
                selected_items: selectedItems,
            }, {
                preserveState: true,
            });
        }
    };

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
                <SheetContent className="flex w-full flex-col bg-gray-50 dark:bg-gray-950 sm:max-w-lg">
                    <SheetHeader className="px-6 pt-4 pb-2">
                        <SheetTitle className="text-xl font-bold text-gray-800 dark:text-gray-100">Keranjang Belanja ({totalItems})</SheetTitle>
                    </SheetHeader>

                    {cartItems.length > 0 ? (
                        <>
                            <div className="flex-1 overflow-y-auto px-6">
                                <div className="flex items-center gap-3 border-b pb-2 mb-2">
                                    <Checkbox
                                        id="select-all"
                                        checked={isAllSelected}
                                        onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
                                        className="h-5 w-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500 data-[state=checked]:bg-orange-500 data-[state=checked]:text-white"
                                    />
                                    <Label htmlFor="select-all" className="text-sm font-medium">
                                        Pilih Semua ({selectedItems.length})
                                    </Label>
                                </div>
                                <div className="divide-y divide-gray-200 dark:divide-gray-800">
                                    {cartItems.map((item) => (
                                        <CartItemCard
                                            key={item.id}
                                            item={item}
                                            onEdit={handleOpenEdit}
                                            isSelected={selectedItems.includes(item.id)}
                                            onSelect={handleSelectItem}
                                        />
                                    ))}
                                </div>
                            </div>

                            <SheetFooter className="mt-auto bg-white dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-800 p-6">
                                <div className="w-full space-y-4">
                                    <div className="flex justify-between text-lg font-semibold text-gray-800 dark:text-gray-100">
                                        <span>Subtotal</span>
                                        <span>Rp {selectedSubtotal.toLocaleString('id-ID')}</span>
                                    </div>
                                    <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                                        Biaya pengiriman dan pajak akan dihitung saat checkout.
                                    </p>
                                    <div className="grid grid-cols-1 gap-3 pt-2">
                                        <Button
                                            size="lg"
                                            className="bg-[#FF6500] text-white hover:bg-[#FF6500]/90 text-lg h-12 rounded-full font-bold"
                                            disabled={selectedItems.length === 0}
                                            onClick={handleCheckout}
                                        >
                                            Checkout
                                        </Button>
                                        <SheetClose asChild>
                                            <Button asChild variant="ghost" size="lg" className="text-lg h-12 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">
                                                Lanjutkan Belanja
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
