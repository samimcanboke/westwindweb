<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as Middleware;

class VerifyCsrfToken extends Middleware
{
    /**
     * The URIs that should be excluded from CSRF verification.
     *
     * @var array
     */
    protected $except = [
        '*', // Tüm rotaları CSRF korumasından muaf tut
    ];

    /**
     * Determine if the session and input CSRF tokens match.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return bool
     */
    protected function tokensMatch($request)
    {
        // Tüm POST ve PUT isteklerinde CSRF doğrulamasını devre dışı bırak
        if (in_array($request->method(), ['POST', 'PUT'])) {
            return true;
        }

        return parent::tokensMatch($request);
    }
}
