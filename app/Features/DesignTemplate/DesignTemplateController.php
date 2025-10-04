<?php

namespace App\Features\DesignTemplate;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class DesignTemplateController extends Controller
{
    public function index(Request $request)
    {
        // Ambil semua kolom dari model kecuali yang tersembunyi
        $model = new DesignTemplate;
        $columns = array_diff($model->getConnection()->getSchemaBuilder()->getColumnListing($model->getTable()), $model->getHidden());

        $query = DesignTemplate::query();

        // Logika untuk Pencarian (Search) di semua kolom
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request, $columns) {
                foreach ($columns as $column) {
                    $q->orWhere($column, 'like', '%' . $request->search . '%');
                }
            });
        }

        // Logika untuk Pengurutan (Sort)
        if ($request->filled('sort_by') && $request->filled('sort_dir')) {
            $query->orderBy($request->sort_by, $request->sort_dir);
        } else {
            $query->latest(); // Urutan default jika tidak ada sort
        }

        return Inertia::render('Features/DesignTemplate/Index', [
            // Kirim data yang sudah difilter dan diurutkan
            'items' => $query->paginate(10)->withQueryString(),
            // Kirim kembali filter yang sedang aktif ke view
            'filters' => $request->only(['search', 'sort_by', 'sort_dir']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Features/DesignTemplate/FormPage');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'thumbnail' => 'required|image|max:2048', // Max 2MB
            'file' => 'required|file|max:10240', // Max 10MB
        ]);

        try {
            DB::beginTransaction();

            $thumbnailPath = $request->file('thumbnail')->store('design-templates/thumbnails', 'public');
            $filePath = $request->file('file')->store('design-templates/files', 'public');

            DesignTemplate::create([
                'name' => $validated['name'],
                'thumbnail_path' => $thumbnailPath,
                'file_path' => $filePath,
            ]);

            DB::commit();

            return redirect()->route('design-templates.index')->with('message', 'Design Template created successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            // Optionally log the error
            return redirect()->back()->with('error', 'Failed to create design template. Please try again.');
        }
    }

    public function edit(DesignTemplate $designTemplate)
    {
        return Inertia::render('Features/DesignTemplate/FormPage', [
            'item' => $designTemplate,
        ]);
    }

    public function update(Request $request, DesignTemplate $designTemplate)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'thumbnail' => 'nullable|image|max:2048', // Max 2MB
            'file' => 'nullable|file|max:10240', // Max 10MB
        ]);

        try {
            DB::beginTransaction();

            $updateData = ['name' => $validated['name']];

            if ($request->hasFile('thumbnail')) {
                // Hapus thumbnail lama jika ada
                if ($designTemplate->thumbnail_path) {
                    Storage::disk('public')->delete($designTemplate->thumbnail_path);
                }
                $updateData['thumbnail_path'] = $request->file('thumbnail')->store('design-templates/thumbnails', 'public');
            }

            if ($request->hasFile('file')) {
                // Hapus file lama jika ada
                if ($designTemplate->file_path) {
                    Storage::disk('public')->delete($designTemplate->file_path);
                }
                $updateData['file_path'] = $request->file('file')->store('design-templates/files', 'public');
            }

            $designTemplate->update($updateData);

            DB::commit();

            return redirect()->route('design-templates.index')->with('message', 'Design Template updated successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            // Optionally log the error
            return redirect()->back()->with('error', 'Failed to update design template. Please try again.');
        }
    }

    public function destroy(DesignTemplate $designTemplate)
    {
        try {
            DB::beginTransaction();

            // Hapus file dari storage
            if ($designTemplate->thumbnail_path) {
                Storage::disk('public')->delete($designTemplate->thumbnail_path);
            }
            if ($designTemplate->file_path) {
                Storage::disk('public')->delete($designTemplate->file_path);
            }

            $designTemplate->delete();

            DB::commit();

            return redirect()->route('design-templates.index')->with('message', 'Design Template deleted successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            // Optionally log the error
            return redirect()->back()->with('error', 'Failed to delete design template. Please try again.');
        }
    }
}
