import { type SharedData, type User } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Button, buttonVariants } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, LogOut, User as UserIcon, LayoutDashboard, Search as SearchIcon, Menu } from 'lucide-react';
import { route } from 'ziggy-js';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';

// Komponen Navigasi untuk Desktop
function NavLinks({ user }: { user: User | null }) {
    return (
        <nav className="hidden items-center gap-6 md:flex">
            <Link href={route('home')} className="text-sm font-medium text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-50">Beranda</Link>
            <Link href="#" className="text-sm font-medium text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-50">Produk</Link>
            <Link href="#" className="text-sm font-medium text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-50">Tentang Kami</Link>
        </nav>
    );
}

// Komponen Aksi di Header
function HeaderActions({ user }: { user: User | null }) {
    if (user) {
        return (
            <div className="flex items-center gap-4">
                {user.role === 'customer' && (
                    <Button variant="ghost" size="icon">
                        <ShoppingCart className="h-5 w-5" />
                        <span className="sr-only">Keranjang Belanja</span>
                    </Button>
                )}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="secondary" size="icon" className="rounded-full">
                            <UserIcon className="h-5 w-5" />
                            <span className="sr-only">Toggle user menu</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Hi, {user.name}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {user.role === 'admin' ? (
                            <DropdownMenuItem asChild>
                                <Link href={route('dashboard')}>
                                    <LayoutDashboard className="mr-2 h-4 w-4" />
                                    <span>Dashboard</span>
                                </Link>
                            </DropdownMenuItem>
                        ) : (
                            <DropdownMenuItem asChild>
                                <Link href="#">
                                    <UserIcon className="mr-2 h-4 w-4" />
                                    <span>Profil Saya</span>
                                </Link>
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href={route('logout')} method="post" as="button" className="w-full">
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Log Out</span>
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        );
    }

    return (
        <div className="hidden items-center gap-2 md:flex">
            <Link href={route('login')} className={buttonVariants({ variant: 'ghost' })}>Log in</Link>
            <Link href={route('register')} className={buttonVariants({ variant: 'default' })}>Register</Link>
        </div>
    );
}

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;
    const [open, setOpen] = useState(false);

    // Dummy product data
    const featuredProducts = [
        { name: 'Mesin Cuci Modern', price: 'Rp 2.500.000', image: 'https://placehold.co/400x400/e2e8f0/64748b?text=Mesin+Cuci' },
        { name: 'AC 2 PK Inverter', price: 'Rp 4.000.000', image: 'https://placehold.co/400x400/e2e8f0/64748b?text=AC' },
        { name: 'Kulkas 2 Pintu', price: 'Rp 4.500.000', image: 'https://placehold.co/400x400/e2e8f0/64748b?text=Kulkas' },
        { name: 'Kursi Santai Scandinavian', price: 'Rp 750.000', image: 'https://placehold.co/400x400/e2e8f0/64748b?text=Kursi' },
    ];

    return (
        <>
            <Head title="Selamat Datang di Haji Elektronik" />
            <div className="flex min-h-screen w-full flex-col bg-slate-50 dark:bg-slate-950">
                {/* Header */}
                <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="container flex h-16 items-center justify-between">
                        <div className="flex items-center gap-6">
                            <Link href="/" className="text-lg font-bold">
                                Haji Elektronik
                            </Link>
                            <NavLinks user={auth.user} />
                        </div>

                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="icon" className="hidden md:inline-flex">
                                <SearchIcon className="h-5 w-5" />
                            </Button>
                            <HeaderActions user={auth.user} />

                            {/* Mobile Menu */}
                            <Sheet open={open} onOpenChange={setOpen}>
                                <SheetTrigger asChild>
                                    <Button variant="outline" size="icon" className="md:hidden">
                                        <Menu className="h-5 w-5" />
                                        <span className="sr-only">Toggle navigation menu</span>
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="left">
                                    <nav className="grid gap-6 text-lg font-medium mt-8">
                                        <Link href={route('home')} className="hover:text-foreground">Beranda</Link>
                                        <Link href="#" className="text-muted-foreground hover:text-foreground">Produk</Link>
                                        <Link href="#" className="text-muted-foreground hover:text-foreground">Tentang Kami</Link>

                                        {!auth.user && (
                                            <>
                                                <Link href={route('login')} className="text-muted-foreground hover:text-foreground">Log in</Link>
                                                <Link href={route('register')} className="text-muted-foreground hover:text-foreground">Register</Link>
                                            </>
                                        )}
                                    </nav>
                                </SheetContent>
                            </Sheet>
                        </div>
                    </div>
                </header>

                <main className="flex-1">
                    {/* Hero Section */}
                    <section className="container grid grid-cols-1 items-center gap-8 py-12 md:grid-cols-2 lg:py-20">
                        <div className="space-y-4 text-center md:text-left">
                            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                                Lengkapi Rumahmu Dengan Sentuhan Elegan
                            </h1>
                            <p className="max-w-[600px] text-slate-600 md:text-xl dark:text-slate-400">
                                Temukan perabotan dan elektronik berkualitas tinggi yang dirancang untuk mempercantik dan mempermudah hidup Anda.
                            </p>
                            <Button size="lg" asChild>
                                <Link href="#">Belanja Sekarang</Link>
                            </Button>
                        </div>
                        <img
                            src="https://placehold.co/600x400/e2e8f0/334155?text=Haji+Elektronik"
                            alt="Perabotan Rumah Tangga"
                            className="mx-auto aspect-video overflow-hidden rounded-xl object-cover"
                        />
                    </section>

                    {/* Featured Products Section */}
                    <section className="container py-12 lg:py-20">
                        <h2 className="mb-8 text-2xl font-bold tracking-tight text-center md:text-3xl">Produk Unggulan</h2>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {featuredProducts.map((product, index) => (
                                <Card key={index}>
                                    <CardHeader className="p-0">
                                        <img src={product.image} alt={product.name} className="aspect-square w-full rounded-t-lg object-cover" />
                                    </CardHeader>
                                    <CardContent className="p-4">
                                        <h3 className="font-semibold">{product.name}</h3>
                                        <p className="text-slate-700 dark:text-slate-300">{product.price}</p>
                                    </CardContent>
                                    <CardFooter className="p-4 pt-0">
                                        <Button className="w-full" asChild>
                                            <Link href="#">Lihat Detail</Link>
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    </section>
                </main>

                {/* Footer */}
                <footer className="border-t bg-slate-100 dark:bg-slate-900">
                    <div className="container py-6 text-center text-sm text-slate-600 dark:text-slate-400">
                        © {new Date().getFullYear()} Haji Elektronik. All rights reserved.
                    </div>
                </footer>
            </div>
        </>
    );
}

