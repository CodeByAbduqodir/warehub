<?php

declare(strict_types=1);

namespace App\Http\Controllers\Tenant;

use App\Actions\Tenant\ConfirmInventoryDocument;
use App\Http\Controllers\Controller;
use App\Http\Requests\Tenant\StoreInventoryDocumentRequest;
use App\Http\Requests\Tenant\UpdateInventoryItemRequest;
use App\Models\Tenant\InventoryDocument;
use App\Models\Tenant\InventoryItem;
use App\Models\Tenant\Stock;
use App\Models\Tenant\Warehouse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class InventoryDocumentController extends Controller
{
    public function index(): Response
    {
        $documents = InventoryDocument::with(['warehouse:id,name'])
            ->withCount('items')
            ->orderByDesc('date')
            ->orderByDesc('id')
            ->paginate(25);

        return Inertia::render('tenant/inventory/index', [
            'documents' => $documents,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('tenant/inventory/create', [
            'warehouses' => Warehouse::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(StoreInventoryDocumentRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $number = 'INV-'.now()->format('Y').'-'.str_pad(
            (string) (InventoryDocument::withTrashed()->count() + 1),
            4, '0', STR_PAD_LEFT
        );

        $document = InventoryDocument::create([
            'number' => $number,
            'date' => $data['date'],
            'warehouse_id' => $data['warehouse_id'],
            'user_id' => Auth::id(),
            'type' => $data['type'],
            'status' => 'in_progress',
            'note' => $data['note'] ?? null,
        ]);

        // Снимок текущих остатков на складе
        Stock::where('warehouse_id', $data['warehouse_id'])
            ->with('product')
            ->get()
            ->each(function (Stock $stock) use ($document): void {
                $document->items()->create([
                    'product_id' => $stock->product_id,
                    'expected_qty' => $stock->quantity,
                    'actual_qty' => null,
                ]);
            });

        return redirect("/inventory/{$document->id}");
    }

    public function show(string $tenant, InventoryDocument $inventoryDocument): Response
    {
        $inventoryDocument->load([
            'warehouse:id,name',
            'items.product:id,name,sku,unit',
            'user:id,name',
        ]);

        return Inertia::render('tenant/inventory/show', [
            'document' => $inventoryDocument,
        ]);
    }

    public function updateItem(string $tenant, InventoryDocument $inventoryDocument, InventoryItem $inventoryItem, UpdateInventoryItemRequest $request): RedirectResponse
    {
        if ($inventoryDocument->isCompleted()) {
            return redirect("/inventory/{$inventoryDocument->id}");
        }

        $inventoryItem->update(['actual_qty' => $request->validated()['actual_qty']]);

        return redirect("/inventory/{$inventoryDocument->id}");
    }

    public function confirm(string $tenant, InventoryDocument $inventoryDocument, ConfirmInventoryDocument $action): RedirectResponse
    {
        if ($inventoryDocument->isCompleted()) {
            return redirect('/inventory');
        }

        $action($inventoryDocument);

        return redirect('/inventory');
    }

    public function destroy(string $tenant, InventoryDocument $inventoryDocument): RedirectResponse
    {
        if ($inventoryDocument->isCompleted()) {
            return redirect('/inventory');
        }

        $inventoryDocument->delete();

        return redirect('/inventory');
    }
}
