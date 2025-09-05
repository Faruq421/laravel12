<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;
use App\Features\Customer\Customer;

class RegisteredUserController extends Controller
{
    /**
     * Show the registration page.
     */
    public function create(): Response
    {
        // Path ini harus sesuai dengan lokasi file Register.tsx Anda
        // Jika file Anda ada di resources/js/Pages/Auth/Register.tsx, maka path ini sudah benar.
        return Inertia::render('auth/register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:' . User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        // Pastikan relasi 'customer' sudah didefinisikan di dalam model User (App\Models\User.php)
        $user->customer()->create();

        event(new Registered($user));

        Auth::login($user);

        // --- PERBAIKAN ---
        // Mengarahkan ke rute yang bernama 'welcome', yang akan menampilkan halaman utama Anda.
        return redirect('/');
    }
}
