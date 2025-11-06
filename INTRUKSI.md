Perintah untuk Gemini CLI: Perbaikan UI (Animasi Menu & Ikon Pencarian)

Tujuan: Melakukan dua perbaikan polishing UI pada file SiteHeader.tsx untuk meningkatkan pengalaman visual.

Tugas 1: Sesuaikan Animasi Menu Navigasi (Desktop)

Target File: resources/js/components/layout/SiteHeader.tsx

Masalah: Animasi menu "Produk & Jasa" saat ini terasa datang dari "atas kiri".
Solusi: Kita akan secara eksplisit menentukan animasi agar hanya "geser dari atas" (slide-in-from-top) dan "fade-in".

Cari baris NavigationMenuContent di dalam NavigationMenuItem "Produk & Jasa".

Cari (Sebelumnya):

<NavigationMenuContent>


Ganti Dengan: Tambahkan className baru untuk menimpa animasi default.

Ganti (Sesudahnya):

<NavigationMenuContent 
    className="data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-top-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-1"
>


(Catatan: Ini memberi kita kontrol penuh atas animasi masuk dan keluar, menghilangkan efek "zoom" atau "geser horizontal" yang tidak diinginkan).

Tugas 2: Perbaiki Perataan Ikon Pencarian (Search)

Target File: resources/js/components/layout/SiteHeader.tsx

Masalah: Ikon Search tidak berada di tengah secara vertikal di dalam Input (terlihat terlalu rendah).
Solusi: Kita akan mengganti metode positioning absolute top-1/2 dengan wrapper flexbox yang lebih stabil.

Cari blok div yang berisi Input pencarian dan ikon Search.

Cari (Sebelumnya):

<div className="hidden md:block relative">
    <Input type="search" placeholder="Cari produk..." className="pl-10 rounded-full" />
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
</div>


Ganti Dengan: Kode baru ini menggunakan div wrapper absolute dengan flex items-center untuk memastikan perataan vertikal yang sempurna, dan pointer-events-none agar klik bisa tembus ke input.

Ganti (Sesudahnya):

<div className="hidden md:block relative">
    <Input type="search" placeholder="Cari produk..." className="pl-10 rounded-full" />
    {/* Wrapper baru untuk perataan vertikal yang stabil */}
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" />
    </div>
</div>


(Catutuan: Pastikan Input masih memiliki pl-10 agar teks tidak tumpang tindih dengan ikon).
