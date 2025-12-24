import { User } from '.';
import { Product } from './product';

export interface Address {
    name: string;
    phone: string;
    address: string;
    province: string;
    city: string;
    district: string;
    postal_code: string;
}

export interface Order {
    id: number;
    user: User;
    order_status:
        | 'pending'
        | 'processing'
        | 'shipped'
        | 'completed'
        | 'cancelled';
    total_price: number;
    shipping_address: Address;
    shipping_cost: number;
    shipping_method: string;
    payment_method: string;
    payment_status: 'unpaid' | 'paid' | 'expired';
    estimated_completion_date: string | null;
    admin_notes: string | null;
    created_at: string;
    updated_at: string;
    items: OrderItem[];
}

export interface OrderItem {
    id: number;
    product: Product;
    quantity: number;
    price: number;
    // TODO: Define a specific type for options
    options: any;
}
