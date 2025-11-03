import React, { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { type PageProps } from '@/types';
import { route } from 'ziggy-js';
import { Search, User, Menu, ChevronDown, LogOut, UserCircle, Package, Printer, Gift, Briefcase, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CartSheet } from '@/components/CartSheet';

const productCategories = [
    { title: 'Promosi & Marketing', icon: <Printer className="h-5 w-5 text-[#FF6500]" />, items: ['Digital Printing', 'Display Promotion', 'Large Format', 'Sticker', 'NameCard & Invitation'] },
    { title: 'Produk & Merchandise', icon: <Gift className="h-5 w-5 text-[#FF6500]" />, items: ['Garment & Textile', 'Merchandise', 'Packaging', 'Home Decor & Photo'] },
    { title: 'Kebutuhan Kantor', icon: <Briefcase className="h-5 w-5 text-[#FF6500]" />, items: ['Stationary', 'Kop Surat', 'Amplop', 'ID Card'] }
];

export default function SiteHeader({ auth }: PageProps) {
    const { user } = auth;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header className={`bg-white sticky top-0 z-50 transition-shadow duration-300 ${isScrolled ? 'shadow-lg' : 'shadow-sm'}`}>
            <div className={`bg-gray-100 text-gray-600 text-xs border-b transition-all duration-300 overflow-hidden ${isScrolled ? 'max-h-0 py-0 border-transparent' : 'max-h-12 py-2'}`}>
                <div className="container mx-auto px-6 flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <a href="tel:08123456789" className="flex items-center hover:text-[#FF6500]"><Phone className="h-4 w-4 mr-1.5" /><span>0812-3456-7890</span></a>
                        <a href="mailto:info@printshop.com" className="hidden sm:flex items-center hover:text-[#FF6500]"><Mail className="h-4 w-4 mr-1.5" /><span>info@printshop.com</span></a>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Link href="#" className="hover:text-[#FF6500]">Lacak Pesanan</Link>
                        <span className="text-gray-300">|</span>
                        <Link href="#" className="hover:text-[#FF6500]">Bantuan</Link>
                    </div>
                </div>
            </div>
            <nav className={`container mx-auto px-6 flex justify-between items-center transition-all duration-300 ${isScrolled ? 'py-2' : 'py-4'}`}>
                <Link href="/"><img src="/storage/logo/logo.png" alt="Logo PrintShop" className={`w-auto transition-all duration-300 ${isScrolled ? 'h-8' : 'h-10'}`} /></Link>
                <div className="hidden lg:flex items-center space-x-6 font-medium">
                    <Link href="/" className="text-gray-700 hover:text-[#FF6500]">Beranda</Link>
                    <div className="relative" onMouseEnter={() => setIsCategoryMenuOpen(true)} onMouseLeave={() => setIsCategoryMenuOpen(false)}>
                        <button className={`flex items-center text-gray-700 hover:text-[#FF6500] focus:outline-none transition-all duration-300 ${isScrolled ? 'py-2' : 'py-3'}`}>
                            Produk & Jasa
                            <ChevronDown className={`h-4 w-4 ml-1 transition-transform duration-200 ${isCategoryMenuOpen ? 'rotate-180' : ''}`} />
                        </button>
                        <div className={`absolute top-full left-1/2 -translate-x-1/2 w-screen max-w-4xl transition-all duration-300 ease-in-out ${isCategoryMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                            <div className="pt-3">
                                <div className="bg-white rounded-xl shadow-2xl p-8 border">
                                    <div className="grid grid-cols-3 gap-x-8 gap-y-10">{productCategories.map((c) => (<div key={c.title}><div className="flex items-center mb-4">{c.icon}<h3 className="font-bold text-gray-800 ml-3">{c.title}</h3></div><ul className="space-y-3">{c.items.map(i => (<li key={i}><Link href="#" className="text-gray-500 hover:text-[#FF6500] text-sm block transition-colors">{i}</Link></li>))}</ul></div>))}</div>
                                    <div className="mt-8 border-t pt-6 text-center"><Link href="#" className="text-[#FF6500] font-semibold hover:underline">Lihat Semua Produk &rarr;</Link></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <Link href="#" className="text-gray-700 hover:text-[#FF6500]">Panduan Cetak</Link>
                    <Link href="#" className="text-gray-700 hover:text-[#FF6500]">Portofolio</Link>
                </div>

                <div className="flex items-center space-x-2 md:space-x-4">
                    <div className="hidden md:block relative"><Input type="search" placeholder="Cari produk..." className="pl-10 rounded-full" /><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" /></div>

                    <CartSheet />

                    <Button asChild className="hidden lg:inline-flex bg-[#FF6500] hover:bg-[#C40C0C] text-white"><Link href="#">Minta Penawaran</Link></Button>

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
                                {user.is_admin && (
                                    <DropdownMenuItem asChild><Link href={route('products.index')}><UserCircle className="mr-2 h-4 w-4" /><span>Admin Dashboard</span></Link></DropdownMenuItem>
                                )}
                                <DropdownMenuItem asChild><Link href="#"><UserCircle className="mr-2 h-4 w-4" /><span>Profil Saya</span></Link></DropdownMenuItem>
                                <DropdownMenuItem asChild><Link href={route('orders.my')}><Package className="mr-2 h-4 w-4" /><span>Pesanan Saya</span></Link></DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild><Link href={route('logout')} method="post" as="button" className="w-full text-left"><LogOut className="mr-2 h-4 w-4" /><span>Logout</span></Link></DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <div className="hidden sm:flex items-center space-x-1">
                            <Button asChild variant="ghost" className="text-gray-700 hover:text-[#FF6500]"><Link href={route('login')}>Log in</Link></Button>
                            <Button asChild className="bg-[#C40C0C] hover:bg-[#a50a0a] text-white"><Link href={route('register')}>Register</Link></Button>
                        </div>
                    )}
                    <button className="lg:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}><Menu className="h-6 w-6" /></button>
                </div>
            </nav>

            {mobileMenuOpen && (
                <div className="lg:hidden bg-white py-4 px-6 space-y-2 border-t">{/* ... Konten Menu Mobile ... */}</div>
            )}
        </header>
    );
}
