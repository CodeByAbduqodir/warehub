<?php

declare(strict_types=1);

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Http\Requests\Tenant\StoreCustomerRequest;
use App\Http\Requests\Tenant\UpdateCustomerRequest;
use App\Models\Tenant\Customer;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class CustomerController extends Controller
{
    public function index(): Response
    {
        $customers = Customer::orderBy('name')->get(['id', 'name', 'phone', 'email', 'address', 'created_at']);

        return Inertia::render('tenant/customers/index', [
            'customers' => $customers,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('tenant/customers/create');
    }

    public function store(StoreCustomerRequest $request): RedirectResponse
    {
        Customer::create($request->validated());

        return redirect('/customers');
    }

    public function edit(string $tenant, Customer $customer): Response
    {
        return Inertia::render('tenant/customers/edit', [
            'customer' => $customer,
        ]);
    }

    public function update(UpdateCustomerRequest $request, string $tenant, Customer $customer): RedirectResponse
    {
        $customer->update($request->validated());

        return redirect('/customers');
    }

    public function destroy(string $tenant, Customer $customer): RedirectResponse
    {
        $customer->delete();

        return redirect('/customers');
    }
}
