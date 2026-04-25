<?php

declare(strict_types=1);

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Http\Requests\Tenant\StoreProductRequest;
use App\Http\Requests\Tenant\UpdateProductRequest;
use App\Models\Tenant\Product;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(): Response
    {
        $search = request('search');

        $products = Product::query()
            ->when($search, fn ($q) => $q->where('name', 'ilike', "%{$search}%"))
            ->latest()
            ->paginate(25)
            ->withQueryString();

        return Inertia::render('tenant/products/index', [
            'products' => $products,
            'filters' => ['search' => $search],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('tenant/products/create');
    }

    public function store(StoreProductRequest $request): RedirectResponse
    {
        Product::create($request->validated());

        return redirect('/products')->with('success', 'Вид товара добавлен');
    }

    public function edit(string $tenant, Product $product): Response
    {
        return Inertia::render('tenant/products/edit', [
            'product' => $product,
        ]);
    }

    public function update(UpdateProductRequest $request, string $tenant, Product $product): RedirectResponse
    {
        $product->update($request->validated());

        return redirect('/products')->with('success', 'Вид товара обновлён');
    }

    public function destroy(string $tenant, Product $product): RedirectResponse
    {
        $product->delete();

        return redirect('/products')->with('success', 'Вид товара удалён');
    }
}
