<?php

declare(strict_types=1);

namespace App\Http\Controllers\Tenant;

use App\Actions\Tenant\ConfirmIncomingDocument;
use App\Http\Controllers\Controller;
use App\Http\Requests\Tenant\StoreIncomingDocumentRequest;
use App\Models\Tenant\IncomingDocument;
use App\Models\Tenant\Product;
use App\Models\Tenant\Supplier;
use App\Models\Tenant\Warehouse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class IncomingDocumentController extends Controller
{
    public function index(): Response
    {
        $documents = IncomingDocument::with(['supplier:id,name', 'warehouse:id,name'])
            ->withCount('items')
            ->orderByDesc('date')
            ->orderByDesc('id')
            ->paginate(25);

        return Inertia::render('tenant/incoming/index', [
            'documents' => $documents,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('tenant/incoming/create', [
            'suppliers' => Supplier::orderBy('name')->get(['id', 'name']),
            'warehouses' => Warehouse::orderBy('name')->get(['id', 'name']),
            'products' => Product::orderBy('name')->get(['id', 'name', 'sku', 'barcode', 'unit', 'purchase_price', 'currency']),
        ]);
    }

    public function store(StoreIncomingDocumentRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $number = 'IN-'.now()->format('Y').'-'.str_pad((string) (IncomingDocument::withTrashed()->count() + 1), 4, '0', STR_PAD_LEFT);

        $document = IncomingDocument::create([
            'number' => $number,
            'date' => $data['date'],
            'supplier_id' => $data['supplier_id'] ?? null,
            'warehouse_id' => $data['warehouse_id'],
            'user_id' => Auth::id(),
            'note' => $data['note'] ?? null,
            'status' => 'draft',
        ]);

        foreach ($data['items'] as $item) {
            $document->items()->create([
                'product_id' => $item['product_id'],
                'quantity' => $item['quantity'],
                'purchase_price' => $item['purchase_price'],
                'zone_id' => $item['zone_id'] ?? null,
                'cell' => $item['cell'] ?? null,
            ]);
        }

        return redirect('/incoming');
    }

    public function show(string $tenant, IncomingDocument $incomingDocument): Response
    {
        $incomingDocument->load([
            'supplier:id,name',
            'warehouse:id,name',
            'items.product:id,name,sku,unit,currency',
            'items.zone:id,name',
            'user:id,name',
        ]);

        return Inertia::render('tenant/incoming/show', [
            'document' => $incomingDocument,
        ]);
    }

    public function confirm(string $tenant, IncomingDocument $incomingDocument, ConfirmIncomingDocument $action): RedirectResponse
    {
        if ($incomingDocument->isConfirmed()) {
            return redirect('/incoming');
        }

        $action($incomingDocument);

        return redirect('/incoming');
    }

    public function destroy(string $tenant, IncomingDocument $incomingDocument): RedirectResponse
    {
        if ($incomingDocument->isConfirmed()) {
            return redirect('/incoming');
        }

        $incomingDocument->delete();

        return redirect('/incoming');
    }
}
