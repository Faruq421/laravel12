// resources/js/Pages/Features/Order/types.ts

import { Product } from "@/types/product";
import { User } from "@/types";

export interface OrderItem {
    id: number;
    order_id: number;
    product_id: number;
    quantity: number;
    price: number;
    product: Product;
    options?: {
        variant?: Record<string, string> | null;
        design?: {
            type: 'template' | 'upload';
            value: string;
            original_filename?: string;
        } | null;
        note?: string | null;
    };
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

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'paid' | 'expired';

export interface Order {
    id: number;
    user_id: number;
    order_status: OrderStatus;
    total_price: number;
    total_amount?: number; // Alias for backward compatibility
    shipping_address: ShippingAddress;
    shipping_cost: number;
    shipping_method: string;
    payment_method: string;
    payment_status: PaymentStatus;
    tracking_number: string | null;
    estimated_completion_date: string | null;
    admin_notes: string | null;
    items: OrderItem[];
    created_at: string;
    updated_at: string;
    user: User;
}