<?php

declare(strict_types=1);

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Http\Requests\Tenant\StoreStockRequest;
use App\Http\Requests\Tenant\UpdateStockRequest;
use App\Models\Tenant\Product;
use App\Models\Tenant\Stock;
use App\Models\Tenant\Warehouse;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class StockController extends Controller
{
    public function index(): Response
    {
        $stock = Stock::with(['product', 'warehouse'])
            ->orderBy('id', 'desc')
            ->paginate(25);

        return Inertia::render('tenant/stock/index', [
            'stock' => $stock,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('tenant/stock/create', [
            'products' => Product::orderBy('name')->get(['id', 'name', 'unit']),
            'warehouses' => Warehouse::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(StoreStockRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $existing = Stock::where('product_id', $validated['product_id'])
            ->where('warehouse_id', $validated['warehouse_id'])
            ->whereNull('zone_id')
            ->whereNull('cell')
            ->first();

        if ($existing) {
            $existing->update(['quantity' => (float) $existing->quantity + (float) $validated['quantity']]);
        } else {
            Stock::create([
                'product_id' => $validated['product_id'],
                'warehouse_id' => $validated['warehouse_id'],
                'quantity' => $validated['quantity'],
                'reserved' => 0,
            ]);
        }

        return redirect('/stock')->with('success', 'Товар добавлен на склад');
    }

    public function edit(string $tenant, Stock $stock): Response
    {
        return Inertia::render('tenant/stock/edit', [
            'stock' => $stock->load(['product', 'warehouse']),
        ]);
    }

    public function update(UpdateStockRequest $request, string $tenant, Stock $stock): RedirectResponse
    {
        $stock->update($request->validated());

        return redirect('/stock')->with('success', 'Количество обновлено');
    }

    public function destroy(string $tenant, Stock $stock): RedirectResponse
    {
        $stock->delete();

        return redirect('/stock')->with('success', 'Запись удалена');
    }
}
