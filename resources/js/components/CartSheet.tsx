import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from '@/components/ui/sheet';
import { usePage, Link } from '@inertiajs/react';
import { ShoppingCart, Trash2, Plus, Minus } from 'lucide-react';
import { PageProps } from '@/types';
import { useMemo } from 'react';

interface CartItem {
    product_id: number;
    name: string;
    quantity: number;
    price: number;
    options: any;
    image: string;
}

interface Cart {
    [id: string]: CartItem;
}

export function CartSheet() {
    const { props } = usePage<PageProps>();
    const cart = props.cart as Cart;
    const cartItems = Object.entries(cart || {});

    const subtotal = useMemo(() => {
        return cartItems.reduce((acc, [, item]) => acc + item.price * item.quantity, 0);
    }, [cartItems]);

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="relative">
                    <ShoppingCart className="h-5 w-5" />
                    {cartItems.length > 0 && (
                        <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-xs text-white">
                            {cartItems.length}
                        </span>
                    )}
                </Button>
            </SheetTrigger>
            <SheetContent className="flex w-full flex-col sm:max-w-lg">
                <SheetHeader>
                    <SheetTitle>Keranjang Belanja</SheetTitle>
                </SheetHeader>
                {cartItems.length > 0 ? (
                    <>
                        <div className="flex-1 overflow-y-auto pr-4">
                            <div className="space-y-4">
                                {cartItems.map(([id, item]) => (
                                    <div key={id} className="flex items-start gap-4">
                                        <img src={item.image} alt={item.name} className="h-20 w-20 rounded-md object-cover" />
                                        <div className="flex-1">
                                            <p className="font-semibold">{item.name}</p>
                                            <p className="text-sm text-gray-500">Rp {item.price.toLocaleString('id-ID')}</p>
                                            {/* TODO: Display options */}
                                            <div className="mt-2 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    {/* TODO: Update quantity */}
                                                    <Button variant="outline" size="icon" className="h-7 w-7"><Minus className="h-4 w-4" /></Button>
                                                    <span className="w-8 text-center">{item.quantity}</span>
                                                    <Button variant="outline" size="icon" className="h-7 w-7"><Plus className="h-4 w-4" /></Button>
                                                </div>
                                                {/* TODO: Remove item */}
                                                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600"><Trash2 className="h-4 w-4" /></Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <SheetFooter className="mt-auto border-t pt-4">
                            <div className="w-full space-y-4">
                                <div className="flex justify-between font-semibold">
                                    <span>Subtotal</span>
                                    <span>Rp {subtotal.toLocaleString('id-ID')}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <Button asChild variant="outline">
                                        <Link href="#">Lihat Keranjang</Link>
                                    </Button>
                                    <Button asChild>
                                        <Link href="#">Checkout</Link>
                                    </Button>
                                </div>
                            </div>
                        </SheetFooter>
                    </>
                ) : (
                    <div className="flex h-full flex-col items-center justify-center">
                        <ShoppingCart className="h-24 w-24 text-gray-300" />
                        <p className="mt-4 text-lg font-semibold">Keranjang Anda kosong</p>
                        <p className="mt-2 text-center text-gray-500">Sepertinya Anda belum menambahkan produk apapun.</p>
                        <SheetTrigger asChild>
                            <Button className="mt-6">Mulai Belanja</Button>
                        </SheetTrigger>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}
