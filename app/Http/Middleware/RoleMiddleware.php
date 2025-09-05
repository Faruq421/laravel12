<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, ...$roles)
    {
        // Pastikan user sudah login
        if (!Auth::check()) {
            return redirect('login');
        }

        // Periksa apakah peran user ada di dalam daftar peran yang diizinkan
        if (!in_array($request->user()->role, $roles)) {
            // Jika tidak, tolak akses
            abort(403, 'Unauthorized Action');
        }

        return $next($request);
    }
}
