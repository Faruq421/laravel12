import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { type PageProps } from '@/types';
import { route } from 'ziggy-js';
import { Search, ShoppingCart, User, Menu, LogOut, UserCircle, Package } from 'lucide-react';
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

export default function Header({ auth }: PageProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { user } = auth;

    return (
        <header className="bg-white shadow-sm sticky top-0 z-50">
            <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
                <Link href="/" className="text-2xl font-bold text-blue-600">
                    PrintShop
                </Link>
                <div className="hidden lg:flex items-center space-x-8">
                    <Link href="#" className="text-gray-600 hover:text-blue-600">Home</Link>
                    <Link href="#" className="text-gray-600 hover:text-blue-600">Shop</Link>
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
                                        <Link href={route('dashboard')}>
                                            <UserCircle className="mr-2 h-4 w-4" />
                                            <span>Admin Dashboard</span>
                                        </Link>
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuItem asChild>
                                    <Link href="#">
                                        <UserCircle className="mr-2 h-4 w-4" />
                                        <span>Profil Saya</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
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
    );
}
