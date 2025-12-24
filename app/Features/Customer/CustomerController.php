<?php

namespace App\Features\Customer;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Inertia\Inertia;

class CustomerController extends Controller
{
    public function index(Request $request)
    {
        // Ambil semua kolom dari model kecuali yang tersembunyi
        $model = new Customer;
        $columns = array_diff($model->getConnection()->getSchemaBuilder()->getColumnListing($model->getTable()), $model->getHidden());

        $query = Customer::query();

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

        return Inertia::render('Features/Customer/Index', [
            // Kirim data yang sudah difilter dan diurutkan
            'items' => $query->paginate(10)->withQueryString(),
            // Kirim kembali filter yang sedang aktif ke view
            'filters' => $request->only(['search', 'sort_by', 'sort_dir']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Features/Customer/FormPage');
    }

    public function store(Request $request)
    {
        // SYNC_VALIDATION_STORE_START
        $validated = $request->validate([
            'user_id' => ['required', 'string', 'max:255'],
            'phone_number' => ['nullable', 'string', 'max:255'],
            'address' => ['nullable', 'string', 'max:255'],
            'city' => ['nullable', 'string', 'max:255'],
            'province' => ['nullable', 'string', 'max:255'],
        ]);
        Customer::create($validated);
        // SYNC_VALIDATION_STORE_END
        return redirect()->route('customers.index')->with('message', 'Customer created successfully.');
    }

    public function edit(Customer $customer)
    {
        return Inertia::render('Features/Customer/FormPage', [
            'item' => $customer,
        ]);
    }

    public function update(Request $request, Customer $customer)
    {
        // SYNC_VALIDATION_UPDATE_START
        $validated = $request->validate([
            'user_id' => ['required', 'string', 'max:255'],
            'phone_number' => ['nullable', 'string', 'max:255'],
            'address' => ['nullable', 'string', 'max:255'],
            'city' => ['nullable', 'string', 'max:255'],
            'province' => ['nullable', 'string', 'max:255'],
        ]);
        $customer->update($validated);
        // SYNC_VALIDATION_UPDATE_END
        return redirect()->route('customers.index')->with('message', 'Customer updated successfully.');
    }

    public function destroy(Customer $customer)
    {
        $customer->delete();
        return redirect()->route('customers.index')->with('message', 'Customer deleted successfully.');
    }
}
