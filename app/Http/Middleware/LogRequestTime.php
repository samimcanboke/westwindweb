<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Log;

class LogRequestTime
{
    public function handle($request, Closure $next)
    {
        $start = microtime(true);
        $response = $next($request);
        $duration = round((microtime(true) - $start) * 1000, 2);

        Log::info('[REQUEST TIME]', [
            'url' => $request->fullUrl(),
            'duration_ms' => $duration
        ]);

        return $response;
    }
}