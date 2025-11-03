import React from 'react';
import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function SiteFooter() {
    return (
        <footer className="bg-gray-800 text-white">
            <div className="container mx-auto px-6 py-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div>
                        <h3 className="font-bold text-lg text-white">PrintShop</h3>
                        <p className="mt-4 text-gray-400">Your one-stop shop for all printing needs.</p>
                    </div>
                    <div>
                        <h3 className="font-semibold">Quick Links</h3>
                        <ul className="mt-4 space-y-2">
                            <li><Link href="#" className="text-gray-400 hover:text-[#FFC100]">About Us</Link></li>
                            <li><Link href="#" className="text-gray-400 hover:text-[#FFC100]">Contact</Link></li>
                            <li><Link href="#" className="text-gray-400 hover:text-[#FFC100]">FAQ</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold">Shop</h3>
                        <ul className="mt-4 space-y-2">
                            <li><Link href="#" className="text-gray-400 hover:text-[#FFC100]">Printers</Link></li>
                            <li><Link href="#" className="text-gray-400 hover:text-[#FFC100]">Inks & Cartridges</Link></li>
                            <li><Link href="#" className="text-gray-400 hover:text-[#FFC100]">Paper</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold">Subscribe</h3>
                        <p className="mt-4 text-gray-400">Get the latest updates and offers.</p>
                        <div className="mt-4 flex">
                            <Input type="email" placeholder="Your email" className="bg-gray-700 border-gray-600 text-white rounded-r-none" />
                            <Button className="bg-[#FF6500] hover:bg-[#C40C0C] text-white rounded-l-none">Subscribe</Button>
                        </div>
                    </div>
                </div>
                <div className="mt-12 border-t border-gray-700 pt-8 text-center text-gray-400 text-sm">
                    &copy; {new Date().getFullYear()} PrintShop. All Rights Reserved.
                </div>
            </div>
        </footer>
    );
}
