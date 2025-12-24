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
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from "@/components/ui/dialog";
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
    DrawerFooter,
    DrawerClose,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";

const productCategories = [
    { title: 'Promosi & Marketing', icon: <Printer className="h-5 w-5 text-primary" />, items: ['Digital Printing', 'Display Promotion', 'Large Format', 'Sticker', 'NameCard & Invitation'] },
    { title: 'Produk & Merchandise', icon: <Gift className="h-5 w-5 text-primary" />, items: ['Garment & Textile', 'Merchandise', 'Packaging', 'Home Decor & Photo'] },
    { title: 'Kebutuhan Kantor', icon: <Briefcase className="h-5 w-5 text-primary" />, items: ['Stationary', 'Kop Surat', 'Amplop', 'ID Card'] }
];

const ListItem = React.forwardRef<
    React.ElementRef<"a">,
    React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
    return (
        <li>
            <NavigationMenuLink asChild>
                <a
                    ref={ref}
                    className={cn(
                        "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                        className
                    )}
                    {...props}
                >
                    <div className="text-sm font-medium leading-none">{title}</div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        {children}
                    </p>
                </a>
            </NavigationMenuLink>
        </li>
    );
});
ListItem.displayName = "ListItem";

export default function SiteHeader({ auth }: PageProps) {
    const { user } = auth;
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
                        <a href="tel:08123456789" className="flex items-center hover:text-primary"><Phone className="h-4 w-4 mr-1.5" /><span>0812-3456-7890</span></a>
                        <a href="mailto:info@printshop.com" className="hidden sm:flex items-center hover:text-primary"><Mail className="h-4 w-4 mr-1.5" /><span>info@printshop.com</span></a>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Link href="#" className="hover:text-primary">Lacak Pesanan</Link>
                        <span className="text-gray-300">|</span>
                        <Link href="#" className="hover:text-primary">Bantuan</Link>
                    </div>
                </div>
            </div>
            <nav className={`container mx-auto px-6 flex justify-between items-center transition-all duration-300 ${isScrolled ? 'py-2' : 'py-4'}`}>
                <Link href="/"><img src="/storage/logo/logo.png" alt="Logo PrintShop" className={`w-auto transition-all duration-300 ${isScrolled ? 'h-8' : 'h-10'}`} /></Link>
                <div className="hidden lg:flex items-center space-x-1">
                    <NavigationMenu>
                        <NavigationMenuList>
                            <NavigationMenuItem>
                                <NavigationMenuLink asChild>
                                    <Link href="/" className={cn(navigationMenuTriggerStyle(), "bg-transparent hover:bg-gray-100 text-gray-700 hover:text-primary text-base font-medium")}>
                                        Beranda
                                    </Link>
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <NavigationMenuTrigger className="text-gray-700 hover:text-primary bg-transparent hover:bg-gray-100 focus:bg-gray-100 data-[active]:bg-gray-100 data-[state=open]:bg-gray-100 text-base font-medium">
                                    Produk & Jasa
                                </NavigationMenuTrigger>
                                <NavigationMenuContent
                                    className="data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-top-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-1"
                                >
                                    <div className="grid grid-cols-3 gap-x-8 gap-y-10 p-8 w-[60rem]">
                                        {productCategories.map((category) => (
                                            <div key={category.title}>
                                                <div className="flex items-center mb-4">
                                                    {category.icon}
                                                    <h3 className="font-bold text-gray-800 ml-3">{category.title}</h3>
                                                </div>
                                                <ul className="space-y-3">
                                                    {category.items.map((item) => (
                                                        <li key={item}>
                                                            <Link href={route('shop.index', { category: category.title })} className="text-gray-500 hover:text-primary text-sm block transition-colors">
                                                                {item}
                                                            </Link>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="border-t bg-gray-50 p-6 text-center">
                                        <Link href={route('shop.index')} className="text-primary font-semibold hover:underline">
                                            Lihat Semua Produk &rarr;
                                        </Link>
                                    </div>
                                </NavigationMenuContent>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <NavigationMenuLink asChild>
                                    <Link href="#" className={cn(navigationMenuTriggerStyle(), "bg-transparent hover:bg-gray-100 text-gray-700 hover:text-primary text-base font-medium")}>
                                        Panduan Cetak
                                    </Link>
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <NavigationMenuLink asChild>
                                    <Link href="#" className={cn(navigationMenuTriggerStyle(), "bg-transparent hover:bg-gray-100 text-gray-700 hover:text-primary text-base font-medium")}>
                                        Portofolio
                                    </Link>
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                        </NavigationMenuList>
                    </NavigationMenu>
                </div>

                <div className="flex items-center space-x-2 md:space-x-4">
                    <div className="hidden md:block relative">
                        <Input type="search" placeholder="Cari produk..." className="pl-10 rounded-full" />
                        {/* Wrapper baru untuk perataan vertikal yang stabil */}
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                    </div>

                    <CartSheet />

                    <Button asChild className="hidden lg:inline-flex bg-primary hover:bg-primary/90 text-primary-foreground"><Link href="#">Minta Penawaran</Link></Button>

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
                                {!!user.is_admin && (
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
                            <Button asChild variant="ghost" className="text-gray-700 hover:text-primary"><Link href={route('login')}>Log in</Link></Button>
                            <Button asChild variant="destructive"><Link href={route('register')}>Register</Link></Button>
                        </div>
                    )}

                    <Dialog>
                        <DialogTrigger asChild>
                            <button className="lg:hidden">
                                <Menu className="h-6 w-6" />
                            </button>
                        </DialogTrigger>
                        <DialogContent className="lg:hidden w-[90vw] rounded-lg">
                            <DialogHeader>
                                <DialogTitle>
                                    <Link href="/"><img src="/storage/logo/logo.png" alt="Logo" className="h-8 w-auto" /></Link>
                                </DialogTitle>
                            </DialogHeader>

                            <div className="py-4 px-2 space-y-2">
                                <DialogClose asChild>
                                    <Link href="/" className="block py-3 px-3 rounded-md text-gray-700 hover:text-primary hover:bg-gray-100 font-medium">Beranda</Link>
                                </DialogClose>

                                <Drawer>
                                    <DrawerTrigger asChild>
                                        <button className="w-full flex justify-between items-center py-3 px-3 rounded-md text-gray-700 hover:text-primary hover:bg-gray-100 font-medium">
                                            <span>Produk & Jasa</span>
                                            <ChevronDown className="h-4 w-4" />
                                        </button>
                                    </DrawerTrigger>
                                    <DrawerContent>
                                        <DrawerHeader>
                                            <DrawerTitle>Produk & Jasa</DrawerTitle>
                                            <DrawerDescription>Pilih kategori yang Anda butuhkan.</DrawerDescription>
                                        </DrawerHeader>
                                        <div className="p-4 max-h-[60vh] overflow-y-auto">
                                            {productCategories.map((category) => (
                                                <div key={category.title} className="mb-6">
                                                    <div className="flex items-center mb-3">
                                                        {category.icon}
                                                        <h3 className="font-bold text-gray-800 ml-3 text-base">{category.title}</h3>
                                                    </div>
                                                    <ul className="space-y-3 pl-2">
                                                        {category.items.map((item) => (
                                                            <li key={item}>
                                                                <DialogClose asChild>
                                                                    <DrawerClose asChild>
                                                                        <Link href={route('shop.index', { category: category.title })} className="text-gray-600 hover:text-primary text-sm block transition-colors">
                                                                            {item}
                                                                        </Link>
                                                                    </DrawerClose>
                                                                </DialogClose>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ))}
                                            <DialogClose asChild>
                                                <DrawerClose asChild>
                                                    <Link href={route('shop.index')} className="text-primary font-semibold hover:underline text-base pl-2 mt-4 block">
                                                        Lihat Semua Produk &rarr;
                                                    </Link>
                                                </DrawerClose>
                                            </DialogClose>
                                        </div>
                                        <DrawerFooter>
                                            <DrawerClose asChild>
                                                <Button variant="outline">Tutup</Button>
                                            </DrawerClose>
                                        </DrawerFooter>
                                    </DrawerContent>
                                </Drawer>

                                <DialogClose asChild>
                                    <Link href="#" className="block py-3 px-3 rounded-md text-gray-700 hover:text-primary hover:bg-gray-100 font-medium">Panduan Cetak</Link>
                                </DialogClose>
                                <DialogClose asChild>
                                    <Link href="#" className="block py-3 px-3 rounded-md text-gray-700 hover:text-primary hover:bg-gray-100 font-medium">Portofolio</Link>
                                </DialogClose>

                                <div className="border-t pt-4 mt-4 space-y-3">
                                    <DialogClose asChild>
                                        <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"><Link href="#">Minta Penawaran</Link></Button>
                                    </DialogClose>
                                    <div className="flex justify-between text-sm">
                                        <DialogClose asChild>
                                            <Link href="#" className="text-gray-600 hover:text-primary">Lacak Pesanan</Link>
                                        </DialogClose>
                                        <DialogClose asChild>
                                            <Link href="#" className="text-gray-600 hover:text-primary">Bantuan</Link>
                                        </DialogClose>
                                    </div>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </nav>
        </header>
    );
}
