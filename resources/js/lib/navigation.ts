import { type NavItem } from "@/types";
import { dashboard } from "@/routes"; // Impor fungsi route dashboard
import { route } from 'ziggy-js';
import { LayoutGrid, Package } from "lucide-react"; // Impor ikon

export const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
        icon: LayoutGrid,
    },
        {
        title: 'Products',
        href: route('products.index', undefined, false),
        icon: Package,
    },
    // LINK BARU AKAN DITAMBAHKAN SECARA OTOMATIS DI SINI
];
