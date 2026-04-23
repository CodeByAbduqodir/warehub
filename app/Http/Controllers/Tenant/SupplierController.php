<?php

declare(strict_types=1);

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Http\Requests\Tenant\StoreSupplierRequest;
use App\Http\Requests\Tenant\UpdateSupplierRequest;
use App\Models\Tenant\Supplier;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class SupplierController extends Controller
{
    public function index(): Response
    {
        $suppliers = Supplier::orderBy('name')->get(['id', 'name', 'phone', 'email', 'address', 'created_at']);

        return Inertia::render('tenant/suppliers/index', [
            'suppliers' => $suppliers,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('tenant/suppliers/create');
    }

    public function store(StoreSupplierRequest $request): RedirectResponse
    {
        Supplier::create($request->validated());

        return redirect('/suppliers');
    }

    public function edit(string $tenant, Supplier $supplier): Response
    {
        return Inertia::render('tenant/suppliers/edit', [
            'supplier' => $supplier,
        ]);
    }

    public function update(UpdateSupplierRequest $request, string $tenant, Supplier $supplier): RedirectResponse
    {
        $supplier->update($request->validated());

        return redirect('/suppliers');
    }

    public function destroy(string $tenant, Supplier $supplier): RedirectResponse
    {
        $supplier->delete();

        return redirect('/suppliers');
    }
}
