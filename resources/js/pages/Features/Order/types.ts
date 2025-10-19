// resources/js/Pages/Features/Order/types.ts

import { Product } from "@/Pages/Features/Product/types";
import { User } from "@/types";

export interface OrderItem {
    id: number;
    order_id: number;
    product_id: number;
    quantity: number;
    price: number;
    product: Product;
    created_at: string;
    updated_at: string;
}

export interface ShippingAddress {
    name: string;
    address: string;
    city: string;
    postal_code: string;
    phone: string;
}

export interface Order {
    id: number;
    user_id: number;
    order_number: string;
    total_amount: number;
    order_status: 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled';
    shipping_address: ShippingAddress;
    items: OrderItem[];
    created_at: string;
    updated_at: string;
    user: User;
}