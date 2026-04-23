<?php

declare(strict_types=1);

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Http\Requests\Tenant\StoreProductRequest;
use App\Http\Requests\Tenant\UpdateProductRequest;
use App\Models\Tenant\Category;
use App\Models\Tenant\Product;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(): Response
    {
        $products = Product::with('category')
            ->latest()
            ->paginate(25);

        return Inertia::render('tenant/products/index', [
            'products' => $products,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('tenant/products/create', [
            'categories' => Category::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(StoreProductRequest $request): RedirectResponse
    {
        Product::create($request->validated());

        return redirect('/products')->with('success', 'Товар успешно добавлен');
    }

    public function edit(string $tenant, Product $product): Response
    {
        return Inertia::render('tenant/products/edit', [
            'product' => $product->load('category'),
            'categories' => Category::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function update(UpdateProductRequest $request, string $tenant, Product $product): RedirectResponse
    {
        $product->update($request->validated());

        return redirect('/products')->with('success', 'Товар обновлён');
    }

    public function destroy(string $tenant, Product $product): RedirectResponse
    {
        $product->delete();

        return redirect('/products')->with('success', 'Товар удалён');
    }
}
