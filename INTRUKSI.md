Perintah untuk Gemini CLI: Perbaiki Nama Prop Modal Quick View

Tujuan: Memperbaiki modal ProductQuickView yang terjebak di loading pada ShopPage.tsx dengan memberikan nama prop yang benar.

File Target: resources/js/Pages/Features/Product/ShopPage.tsx

Tugas 1: Perbaiki Nama Prop di <ProductQuickView>

Buka file ShopPage.tsx.

Gulir ke bagian paling bawah file, temukan di mana komponen <ProductQuickView> dirender.

Cari Kode yang Salah:

{selectedProductSlug && (
    <ProductQuickView
        slug={selectedProductSlug} // <--- INI SALAH
        isOpen={isQuickViewOpen}
        onClose={handleCloseQuickView}
    />
)}


Ganti dengan Kode yang Benar: (Ubah slug menjadi productSlug)

{selectedProductSlug && (
    <ProductQuickView
        productSlug={selectedProductSlug} // <--- INI BENAR
        isOpen={isQuickViewOpen}
        onClose={handleCloseQuickView}
    />
)}
