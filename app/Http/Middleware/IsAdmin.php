<?php

namespace App\Http\Middleware;

use Closure;
use Auth;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IsAdmin
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();
        if($user){
            if ($user && ($user->is_admin == 1 || $user->accountant == 1)) {
                return $next($request);
            } else {
                return redirect('dashboard')->with('error','You have not admin access');
            }
        } else {
            return redirect('login');
        }
    }
}
