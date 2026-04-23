<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureTenant
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! tenancy()->initialized) {
            abort(404);
        }

        if (! tenant()->isActive()) {
            abort(403, 'This workspace has been suspended.');
        }

        return $next($request);
    }
}
