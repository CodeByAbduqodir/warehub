<?php

declare(strict_types=1);

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Http\Requests\Tenant\StoreStockRequest;
use App\Http\Requests\Tenant\UpdateStockRequest;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Warehub\Core\Models\Tenant\Product;
use Warehub\Core\Models\Tenant\Stock;
use Warehub\Core\Models\Tenant\Warehouse;

class StockController extends Controller
{
    public function index(Request $request): Response
    {
        $data = $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
        ]);
        $search = $data['search'] ?? null;

        $stock = Stock::with(['product', 'warehouse'])
            ->when($search, function (Builder $query) use ($search): void {
                $term = "%{$search}%";

                $query->whereHas('product', function (Builder $productQuery) use ($term): void {
                    $productQuery->where(function (Builder $productQuery) use ($term): void {
                        $productQuery
                            ->whereLike('name', $term)
                            ->orWhereLike('sku', $term)
                            ->orWhereLike('barcode', $term);
                    });
                });
            })
            ->orderBy('id', 'desc')
            ->paginate(25)
            ->withQueryString();

        return Inertia::render('tenant/stock/index', [
            'stock' => $stock,
            'filters' => ['search' => $search],
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

    public function edit(Stock $stock): Response
    {
        return Inertia::render('tenant/stock/edit', [
            'stock' => $stock->load(['product', 'warehouse']),
        ]);
    }

    public function update(UpdateStockRequest $request, Stock $stock): RedirectResponse
    {
        $stock->update($request->validated());

        return redirect('/stock')->with('success', 'Количество обновлено');
    }

    public function destroy(Stock $stock): RedirectResponse
    {
        $stock->delete();

        return redirect('/stock')->with('success', 'Запись удалена');
    }
}
