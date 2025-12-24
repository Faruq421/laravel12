import { AuthenticatedLayout } from '@/layouts/authenticated-layout';
import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';

interface CartItem {
    id: string;
    name: string;
    quantity: number;
    price: number;
    image: string;
}

interface CartIndexProps extends PageProps {
    cartItems: CartItem[];
    subtotal: number;
}

export default function CartIndex({ auth, cartItems, subtotal }: CartIndexProps) {
    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Keranjang Belanja" />

            <div className="container mx-auto py-10">
                <h1 className="text-3xl font-bold mb-6">Keranjang Belanja Anda</h1>

                {Object.values(cartItems).length > 0 ? (
                    <div>
                        {Object.values(cartItems).map((item) => (
                            <div key={item.id} className="flex items-center justify-between border-b py-4">
                                <div className="flex items-center gap-4">
                                    <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-md" />
                                    <div>
                                        <p className="font-semibold">{item.name}</p>
                                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                    </div>
                                </div>
                                <p className="font-semibold">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</p>
                            </div>
                        ))}
                         <div className="mt-6 text-right">
                            <p className="text-xl font-bold">Subtotal: Rp {subtotal.toLocaleString('id-ID')}</p>
                            <Link href={route('checkout.create')} className="inline-block mt-4 px-6 py-3 bg-blue-500 text-white rounded-lg">
                                Lanjutkan ke Checkout
                            </Link>
                        </div>
                    </div>
                ) : (
                    <p>Keranjang Anda kosong.</p>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
