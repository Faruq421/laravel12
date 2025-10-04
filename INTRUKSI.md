Instruksi Teknis: Fungsionalisasi Fitur Opsi Desain di Sisi Admin
1. Persona AI
Anda adalah seorang Senior Full-Stack Developer yang ahli dalam tumpukan teknologi Laravel, React (Inertia.js), dan shadcn/ui. Tugas Anda adalah mengeksekusi serangkaian modifikasi kode untuk mengimplementasikan fungsionalitas admin yang telah direncanakan.

2. Tujuan Utama
Membuat fitur "Manajemen Template Desain" menjadi fungsional sepenuhnya di sisi admin, dan menghubungkannya ke dalam form manajemen produk.

FASE 1: Membuat CRUD DesignTemplate Fungsional
Langkah 1.1: Modifikasi DesignTemplateController untuk Unggah File
Buka file app/Features/Product/DesignTemplateController.php. Modifikasi method store(), update(), dan destroy() untuk menangani penyimpanan dan penghapusan file.

A. Modifikasi store():

public function store(Request $request)
{
    $validated = $request->validate([
        'name' => 'required|string|max:255',
        'thumbnail_path' => 'required|image|max:2048',
        'file_path' => 'required|file|max:10240', // Maks 10MB
    ]);

    if ($request->hasFile('thumbnail_path')) {
        $validated['thumbnail_path'] = $request->file('thumbnail_path')->store('design_thumbnails', 'public');
    }

    if ($request->hasFile('file_path')) {
        $validated['file_path'] = $request->file('file_path')->store('design_files', 'public');
    }

    DesignTemplate::create($validated);

    return redirect()->route('design-templates.index')->with('message', 'Template berhasil ditambahkan.');
}

B. Modifikasi update():

public function update(Request $request, DesignTemplate $designTemplate)
{
    $validated = $request->validate([
        'name' => 'required|string|max:255',
        'thumbnail_path' => 'nullable|image|max:2048',
        'file_path' => 'nullable|file|max:10240',
    ]);

    if ($request->hasFile('thumbnail_path')) {
        if ($designTemplate->thumbnail_path) {
            Storage::disk('public')->delete($designTemplate->thumbnail_path);
        }
        $validated['thumbnail_path'] = $request->file('thumbnail_path')->store('design_thumbnails', 'public');
    }

    if ($request->hasFile('file_path')) {
        if ($designTemplate->file_path) {
            Storage::disk('public')->delete($designTemplate->file_path);
        }
        $validated['file_path'] = $request->file('file_path')->store('design_files', 'public');
    }

    $designTemplate->update($validated);

    return redirect()->route('design-templates.index')->with('message', 'Template berhasil diperbarui.');
}

C. Modifikasi destroy():

public function destroy(DesignTemplate $designTemplate)
{
    if ($designTemplate->thumbnail_path) {
        Storage::disk('public')->delete($designTemplate->thumbnail_path);
    }
    if ($designTemplate->file_path) {
        Storage::disk('public')->delete($designTemplate->file_path);
    }
    
    $designTemplate->delete();

    return redirect()->route('design-templates.index')->with('message', 'Template berhasil dihapus.');
}

Langkah 1.2: Modifikasi Form DesignTemplate di Frontend
Buka resources/js/Pages/Features/Product/DesignTemplate/FormPage.tsx. Ganti input teks standar untuk thumbnail_path dan file_path menjadi komponen input file yang user-friendly.

Tambahkan komponen Input File dengan Preview:

// Ganti input untuk thumbnail_path dengan ini:
<div>
    <Label htmlFor="thumbnail_path">Gambar Thumbnail (Preview)</Label>
    <Input id="thumbnail_path" type="file" onChange={(e) => setData('thumbnail_path', e.target.files[0])} />
    {/* Tampilkan preview jika sedang mengedit */}
    {item?.thumbnail_path && !data.thumbnail_path && (
        <img src={`/storage/${item.thumbnail_path}`} alt="Thumbnail Preview" className="mt-4 w-32 h-32 object-cover rounded-md" />
    )}
    <InputError message={errors.thumbnail_path} className="mt-2" />
</div>

// Ganti input untuk file_path dengan ini:
<div>
    <Label htmlFor="file_path">File Desain Resolusi Tinggi</Label>
    <Input id="file_path" type="file" onChange={(e) => setData('file_path', e.target.files[0])} />
    {item?.file_path && <p className="text-sm text-gray-500 mt-2">File saat ini: {item.file_path.split('/').pop()}</p>}
    <InputError message={errors.file_path} className="mt-2" />
</div>

FASE 2: Menghubungkan Produk dengan Template
Langkah 2.1: Perbarui ProductController untuk Mengirim Data Template
Buka app/Features/Product/ProductController.php. Modifikasi method create() dan edit() untuk mengirimkan daftar semua template desain yang tersedia.

// Di dalam method create():
return Inertia::render('Features/Product/FormPage', [
    'categories' => Category::all(),
    'allAttributes' => Attribute::with('values')->get(),
    'allDesignTemplates' => \App\Features\Product\DesignTemplate::all(), // <-- Tambahkan ini
]);

// Di dalam method edit():
return Inertia::render('Features/Product/FormPage', [
    'item' => $product->load('attributeValues.attribute', 'designTemplates'), // <-- Tambahkan 'designTemplates'
    'categories' => Category::all(),
    'allAttributes' => Attribute::with('values')->get(),
    'allDesignTemplates' => \App\Features\Product\DesignTemplate::all(), // <-- Tambahkan ini
]);

Langkah 2.2: Tambahkan Kolom allow_custom_design pada Model Product
Buka app/Features/Product/Product.php dan tambahkan allow_custom_design ke array $fillable.

Langkah 2.3: Modifikasi Form Produk Admin (FormPage.tsx)
Buka resources/js/Pages/Features/Product/FormPage.tsx. Tambahkan Switch untuk allow_custom_design dan MultiSelect kondisional untuk memilih template.

// Tambahkan import Switch dan Label
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

// Di dalam form, tambahkan field ini:
<div className="flex items-center space-x-2">
    <Switch 
        id="allow_custom_design" 
        checked={data.allow_custom_design}
        onCheckedChange={(checked) => setData('allow_custom_design', checked)}
    />
    <Label htmlFor="allow_custom_design">Izinkan Opsi Desain untuk Pelanggan</Label>
</div>

{/* Tampilkan pilihan template jika switch aktif */}
{data.allow_custom_design && (
    <div>
        <Label>Hubungkan Template Desain</Label>
        {/* IMPLEMENTASIKAN KOMPONEN MULTI-SELECT DI SINI */}
        {/* Anda bisa menggunakan komponen seperti 'react-select' atau 'shadcn-ui combobox' */}
        {/* Pilihan yang tersedia adalah 'allDesignTemplates' dari props */}
        {/* Nilai yang terpilih harus di-set ke data.design_templates (sebagai array of IDs) */}
        <p className="text-sm text-gray-500 mt-2">
            Pilih template dari perpustakaan yang relevan untuk produk ini.
        </p>
    </div>
)}

Langkah 2.4: Perbarui Logika Penyimpanan di ProductController
Di dalam app/Features/Product/ProductController.php, modifikasi method store() dan update() untuk menyinkronkan relasi designTemplates.

// Di dalam blok DB::transaction() setelah produk dibuat atau diupdate:
$product->designTemplates()->sync($request->input('design_templates', []));

Selesaikan semua instruksi di atas secara berurutan.


