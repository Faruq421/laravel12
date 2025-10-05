export interface Product {
    id_produk: number;
    nama_produk: string;
    slug: string;
    deskripsi: string;
    harga: number;
    stok: number;
    gambar: string;
    gambar_url: string;
    category_id: number;
    status: boolean;
    allow_custom_design: boolean;
    enable_design_feature: boolean;
    created_at: string;
    updated_at: string;
}
