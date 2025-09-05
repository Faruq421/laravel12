import { Link, Head, usePage } from '@inertiajs/react';
import { type PageProps } from '@/types';
import { route } from 'ziggy-js';
import { Search, ShoppingCart, User, Menu, Truck, Headset, ShieldCheck, Award, LogOut, UserCircle, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import React, { useState } from 'react';

// --- Data Dummy (tidak ada perubahan) ---
const categories = [
    { name: 'Laser Printers', image: 'https://placehold.co/150x150/e0e0e0/757575?text=Laser' },
    { name: 'Printer Ink', image: 'https://placehold.co/150x150/e0e0e0/757575?text=Ink' },
    { name: 'Inkjet Printers', image: 'https://placehold.co/150x150/e0e0e0/757575?text=Inkjet' },
    { name: 'Printer Cartridges', image: 'https://placehold.co/150x150/e0e0e0/757575?text=Cartridge' },
    { name: 'Paper', image: 'https://placehold.co/150x150/e0e0e0/757575?text=Paper' },
    { name: 'Ink Cartridge', image: 'https://placehold.co/150x150/e0e0e0/757575?text=Ink' },
    { name: '3D Printer', image: 'https://placehold.co/150x150/e0e0e0/757575?text=3D' },
];
const saleProducts = [
    { title: 'Winter Sale', price: 150, image: 'https://placehold.co/100x100/e0e0e0/757575?text=Printer' },
    { title: 'Winter Sale', price: 70, image: 'https://placehold.co/100x100/e0e0e0/757575?text=Cartridges' },
    { title: 'Winter Sale', price: 70, image: 'https://placehold.co/100x100/e0e0e0/757575?text=Ink' },
];
const features = [
    { icon: <Truck className="h-8 w-8 text-blue-600" />, title: 'Free Shipping', description: 'On all your order' },
    { icon: <Headset className="h-8 w-8 text-blue-600" />, title: 'Customer Support 24/7', description: 'Instant access to support' },
    { icon: <ShieldCheck className="h-8 w-8 text-blue-600" />, title: '100% Secure Payment', description: 'We ensure your money is safe' },
    { icon: <Award className="h-8 w-8 text-blue-600" />, title: 'Money-Back Guarantee', description: '30 Days Money-Back Guarantee' },
];

export default function Welcome({ auth }: PageProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { user } = auth; // Ambil user dari auth untuk kemudahan

    return (
        <>
            <Head title="Welcome to Perfect Prints" />
            <div className="bg-gray-50 text-gray-800 font-sans">

                {/* --- Header --- */}
                <header className="bg-white shadow-sm sticky top-0 z-50">
                    <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
                        <Link href="/" className="text-2xl font-bold text-blue-600">
                            PrintShop
                        </Link>
                        <div className="hidden lg:flex items-center space-x-8">
                            <Link href="#" className="text-gray-600 hover:text-blue-600">Home</Link>
                            <Link href="#" className="text-gray-600 hover:text-blue-600">Shop</Link>
                            <Link href="#" className="text-gray-600 hover:text-blue-600">Categories</Link>
                            <Link href="#" className="text-gray-600 hover:text-blue-600">Contact</Link>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="hidden md:block relative">
                                <Input type="search" placeholder="Search..." className="pl-10" />
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            </div>
                            <Link href="#" className="relative text-gray-600 hover:text-blue-600">
                                <ShoppingCart className="h-6 w-6" />
                                <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">0</span>
                            </Link>

                            {/* --- LOGIKA BARU UNTUK USER --- */}
                            {user ? (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="rounded-full">
                                            <User className="h-6 w-6" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-56">
                                        <DropdownMenuLabel>
                                            <div className="font-medium">{user.name}</div>
                                            <div className="text-xs text-gray-500">{user.email}</div>
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        {/* Cek jika user adalah admin */}
                                        {user.is_admin && (
                                            <DropdownMenuItem asChild>
                                                {/* Asumsi Anda punya route untuk dashboard admin */}
                                                <Link href={route('dashboard')}>
                                                    <UserCircle className="mr-2 h-4 w-4" />
                                                    <span>Admin Dashboard</span>
                                                </Link>
                                            </DropdownMenuItem>
                                        )}
                                        <DropdownMenuItem asChild>
                                            {/* TODO: Buat route 'profile.edit' di web.php */}
                                            <Link href="#">
                                                <UserCircle className="mr-2 h-4 w-4" />
                                                <span>Profil Saya</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            {/* TODO: Buat route 'orders.index' di web.php */}
                                            <Link href="#">
                                                <Package className="mr-2 h-4 w-4" />
                                                <span>Pesanan Saya</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem asChild>
                                            <Link href={route('logout')} method="post" as="button" className="w-full text-left">
                                                <LogOut className="mr-2 h-4 w-4" />
                                                <span>Logout</span>
                                            </Link>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ) : (
                                <div className="hidden sm:flex items-center space-x-2">
                                    <Button asChild variant="ghost">
                                        <Link href={route('login')}>Log in</Link>
                                    </Button>
                                    <Button asChild>
                                        <Link href={route('register')}>Register</Link>
                                    </Button>
                                </div>
                            )}

                            <button className="lg:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                                <Menu className="h-6 w-6" />
                            </button>
                        </div>
                    </nav>
                    {/* Mobile Menu */}
                    {mobileMenuOpen && (
                        <div className="lg:hidden bg-white py-4 px-6 space-y-4 border-t">
                            <Link href="#" className="block text-gray-600 hover:text-blue-600">Home</Link>
                            <Link href="#" className="block text-gray-600 hover:text-blue-600">Shop</Link>
                            <Link href="#" className="block text-gray-600 hover:text-blue-600">Categories</Link>
                            <Link href="#" className="block text-gray-600 hover:text-blue-600">Contact</Link>
                            {!user && (
                                <div className="pt-4 border-t space-y-2">
                                    <Button asChild className="w-full">
                                        <Link href={route('login')}>Log in</Link>
                                    </Button>
                                    <Button asChild variant="outline" className="w-full">
                                        <Link href={route('register')}>Register</Link>
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </header>

                <main>
                    {/* --- Hero Section --- */}
                    <section className="bg-gradient-to-r from-blue-50 via-white to-green-50 py-20">
                        <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
                            <div className="text-center md:text-left">
                                <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight">
                                    Perfect Prints,
                                    <span className="text-blue-600"> Every Time.</span>
                                </h1>
                                <p className="mt-4 text-lg text-gray-600">
                                    Power Up Your Printing - Fast, Reliable & Affordable!
                                </p>
                                <div className="mt-8 flex justify-center md:justify-start space-x-4">
                                    <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                                        Shop Now &rarr;
                                    </Button>
                                    <Button size="lg" variant="ghost" className="text-blue-600 hover:bg-blue-50">
                                        View Details
                                    </Button>
                                </div>
                            </div>
                            <div>
                                <img src="https://placehold.co/600x400/FFFFFF/000000?text=Epson+Printer" alt="Epson Printer" className="rounded-lg shadow-2xl mx-auto" />
                            </div>
                        </div>
                    </section>

                    {/* ... Sisa dari konten main Anda tetap sama ... */}
                    {/* --- Promo Section --- */}
                    <section className="container mx-auto px-6 py-16">
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <div className="lg:col-span-1 p-8 rounded-lg bg-white">
                                <h2 className="text-3xl font-bold">30% OFF</h2>
                                <p className="mt-2 text-gray-600">Power Up Your Printing - Fast, Reliable & Affordable!</p>
                                <Button className="mt-6 bg-blue-600 hover:bg-blue-700">Shop Now</Button>
                            </div>
                            {saleProducts.map((product, index) => (
                                <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                                    <CardContent className="p-4 flex items-center space-x-4">
                                        <img src={product.image} alt={product.title} className="w-24 h-24 object-cover rounded-md" />
                                        <div>
                                            <h3 className="font-semibold text-gray-500">{product.title}</h3>
                                            <p className="text-2xl font-bold text-gray-900">${product.price}</p>
                                            <Link href="#" className="text-blue-600 font-semibold mt-2 inline-block">Shop Now</Link>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </section>

                    {/* --- Features Section --- */}
                    <section className="bg-white">
                        <div className="container mx-auto px-6 py-12 border-t border-b">
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
                                {features.map((feature, index) => (
                                    <div key={index} className="flex flex-col items-center">
                                        {feature.icon}
                                        <h3 className="mt-4 font-semibold text-lg">{feature.title}</h3>
                                        <p className="text-gray-500 text-sm">{feature.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* --- Categories Section --- */}
                    <section className="container mx-auto px-6 py-16 text-center">
                        <p className="text-blue-600 font-semibold">Shop by Category</p>
                        <h2 className="mt-2 text-4xl font-extrabold text-gray-900">Shop Our Hottest Categories</h2>
                        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6">
                            {categories.map((category, index) => (
                                <Link href="#" key={index} className="group text-center">
                                    <div className="w-32 h-32 mx-auto bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border-2 border-transparent group-hover:border-blue-500 transition-all duration-300 transform group-hover:scale-105">
                                        <img src={category.image} alt={category.name} className="object-cover w-full h-full" />
                                    </div>
                                    <h3 className="mt-4 font-semibold text-gray-800 group-hover:text-blue-600">{category.name}</h3>
                                </Link>
                            ))}
                        </div>
                    </section>

                    {/* --- Collection Section --- */}
                    <section className="bg-white py-16 text-center">
                        <div className="container mx-auto px-6">
                            <h2 className="text-4xl font-extrabold text-gray-900">Discover Our Collection</h2>
                            <div className="mt-8 flex justify-center space-x-2 md:space-x-4">
                                <Button variant="ghost" className="text-gray-600">Newest</Button>
                                <Button className="bg-blue-600 hover:bg-blue-700">Top Sell</Button>
                                <Button variant="ghost" className="text-gray-600">Popular</Button>
                                <Button variant="ghost" className="text-gray-600">Trending</Button>
                                <Button variant="ghost" className="text-gray-600">Top Rated</Button>
                            </div>
                            {/* Product Grid Placeholder */}
                            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                                {/* Ganti ini dengan data produk dinamis Anda */}
                                {Array.from({ length: 8 }).map((_, i) => (
                                    <Card key={i} className="text-left overflow-hidden group">
                                        <div className="overflow-hidden">
                                            <img src={`https://placehold.co/400x400/f0f0f0/757575?text=Product+${i + 1}`} alt={`Product ${i + 1}`} className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300" />
                                        </div>
                                        <CardContent className="p-4">
                                            <p className="text-sm text-gray-500">Category</p>
                                            <h3 className="font-semibold text-lg mt-1">Product Name {i + 1}</h3>
                                            <p className="font-bold text-xl text-blue-600 mt-2">$99.00</p>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </section>

                </main>

                {/* --- Footer --- */}
                <footer className="bg-gray-800 text-white">
                    <div className="container mx-auto px-6 py-12">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            <div>
                                <h3 className="font-bold text-lg">PrintShop</h3>
                                <p className="mt-4 text-gray-400">Your one-stop shop for all printing needs.</p>
                            </div>
                            <div>
                                <h3 className="font-semibold">Quick Links</h3>
                                <ul className="mt-4 space-y-2">
                                    <li><Link href="#" className="text-gray-400 hover:text-white">About Us</Link></li>
                                    <li><Link href="#" className="text-gray-400 hover:text-white">Contact</Link></li>
                                    <li><Link href="#" className="text-gray-400 hover:text-white">FAQ</Link></li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-semibold">Shop</h3>
                                <ul className="mt-4 space-y-2">
                                    <li><Link href="#" className="text-gray-400 hover:text-white">Printers</Link></li>
                                    <li><Link href="#" className="text-gray-400 hover:text-white">Inks & Cartridges</Link></li>
                                    <li><Link href="#" className="text-gray-400 hover:text-white">Paper</Link></li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-semibold">Subscribe</h3>
                                <p className="mt-4 text-gray-400">Get the latest updates and offers.</p>
                                <div className="mt-4 flex">
                                    <Input type="email" placeholder="Your email" className="bg-gray-700 border-gray-600 text-white rounded-r-none" />
                                    <Button className="bg-blue-600 hover:bg-blue-700 rounded-l-none">Subscribe</Button>
                                </div>
                            </div>
                        </div>
                        <div className="mt-12 border-t border-gray-700 pt-8 text-center text-gray-400 text-sm">
                            &copy; {new Date().getFullYear()} PrintShop. All Rights Reserved.
                        </div>
                    </div>
                </footer>

            </div>
        </>
    );
};

