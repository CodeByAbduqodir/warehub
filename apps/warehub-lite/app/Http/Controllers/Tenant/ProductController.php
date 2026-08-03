<?php

declare(strict_types=1);

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Http\Requests\Tenant\StoreProductRequest;
use App\Http\Requests\Tenant\UpdateProductRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Warehub\Core\Models\Tenant\Product;

class ProductController extends Controller
{
    public function index(Request $request): Response
    {
        $data = $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
        ]);
        $search = $data['search'] ?? null;

        $products = Product::query()
            ->when($search, fn ($query) => $query->whereLike('name', "%{$search}%"))
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

    public function edit(Product $product): Response
    {
        return Inertia::render('tenant/products/edit', [
            'product' => $product,
        ]);
    }

    public function update(UpdateProductRequest $request, Product $product): RedirectResponse
    {
        $product->update($request->validated());

        return redirect('/products')->with('success', 'Вид товара обновлён');
    }

    public function destroy(Product $product): RedirectResponse
    {
        $product->delete();

        return redirect('/products')->with('success', 'Вид товара удалён');
    }
}
