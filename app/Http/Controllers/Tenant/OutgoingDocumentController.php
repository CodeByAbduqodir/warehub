<?php

declare(strict_types=1);

namespace App\Http\Controllers\Tenant;

use App\Actions\Tenant\ConfirmOutgoingDocument;
use App\Http\Controllers\Controller;
use App\Http\Requests\Tenant\StoreOutgoingDocumentRequest;
use App\Models\Tenant\Customer;
use App\Models\Tenant\OutgoingDocument;
use App\Models\Tenant\Stock;
use App\Models\Tenant\Warehouse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class OutgoingDocumentController extends Controller
{
    public function index(): Response
    {
        $documents = OutgoingDocument::with(['customer:id,name', 'warehouse:id,name'])
            ->withCount('items')
            ->orderByDesc('date')
            ->orderByDesc('id')
            ->paginate(25);

        return Inertia::render('tenant/outgoing/index', [
            'documents' => $documents,
        ]);
    }

    public function create(): Response
    {
        $warehouseId = Warehouse::value('id');

        $stock = $warehouseId
            ? Stock::where('warehouse_id', $warehouseId)
                ->where('quantity', '>', 0)
                ->with('product:id,name,sku,barcode,unit,retail_price,currency')
                ->get()
            : collect();

        return Inertia::render('tenant/outgoing/create', [
            'customers' => Customer::orderBy('name')->get(['id', 'name']),
            'warehouses' => Warehouse::orderBy('name')->get(['id', 'name']),
            'stock' => $stock->map(fn ($s) => [
                'product_id' => $s->product_id,
                'product_name' => $s->product->name,
                'product_sku' => $s->product->sku,
                'product_barcode' => $s->product->barcode,
                'unit' => $s->product->unit,
                'retail_price' => $s->product->retail_price,
                'currency' => $s->product->currency,
                'available' => (float) $s->quantity - (float) $s->reserved,
                'warehouse_id' => $s->warehouse_id,
            ]),
        ]);
    }

    public function store(StoreOutgoingDocumentRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $number = 'OUT-'.now()->format('Y').'-'.str_pad((string) (OutgoingDocument::withTrashed()->count() + 1), 4, '0', STR_PAD_LEFT);

        $document = OutgoingDocument::create([
            'number' => $number,
            'date' => $data['date'],
            'customer_id' => $data['customer_id'] ?? null,
            'warehouse_id' => $data['warehouse_id'],
            'user_id' => Auth::id(),
            'note' => $data['note'] ?? null,
            'status' => 'draft',
        ]);

        foreach ($data['items'] as $item) {
            $document->items()->create([
                'product_id' => $item['product_id'],
                'quantity' => $item['quantity'],
                'retail_price' => $item['retail_price'],
            ]);
        }

        return redirect('/outgoing');
    }

    public function show(string $tenant, OutgoingDocument $outgoingDocument): Response
    {
        $outgoingDocument->load([
            'customer:id,name',
            'warehouse:id,name',
            'items.product:id,name,sku,unit,currency',
            'user:id,name',
        ]);

        return Inertia::render('tenant/outgoing/show', [
            'document' => $outgoingDocument,
        ]);
    }

    public function confirm(string $tenant, OutgoingDocument $outgoingDocument, ConfirmOutgoingDocument $action): RedirectResponse
    {
        if ($outgoingDocument->isConfirmed()) {
            return redirect('/outgoing');
        }

        $outgoingDocument->load('items.product');
        $action($outgoingDocument);

        return redirect('/outgoing');
    }

    public function pos(): Response
    {
        $warehouses = Warehouse::orderBy('name')->get(['id', 'name']);
        $firstWarehouseId = $warehouses->first()?->id;

        $stock = $firstWarehouseId
            ? Stock::where('warehouse_id', $firstWarehouseId)
                ->where('quantity', '>', 0)
                ->with('product:id,name,sku,barcode,unit,retail_price,currency')
                ->get()
            : collect();

        return Inertia::render('tenant/outgoing/pos', [
            'warehouses' => $warehouses,
            'customers' => Customer::orderBy('name')->get(['id', 'name']),
            'stock' => $stock->map(fn ($s) => [
                'product_id' => $s->product_id,
                'product_name' => $s->product->name,
                'product_sku' => $s->product->sku,
                'product_barcode' => $s->product->barcode,
                'unit' => $s->product->unit,
                'retail_price' => $s->product->retail_price,
                'currency' => $s->product->currency,
                'available' => (float) $s->quantity - (float) $s->reserved,
                'warehouse_id' => $s->warehouse_id,
            ]),
        ]);
    }

    public function destroy(string $tenant, OutgoingDocument $outgoingDocument): RedirectResponse
    {
        if ($outgoingDocument->isConfirmed()) {
            return redirect('/outgoing');
        }

        $outgoingDocument->delete();

        return redirect('/outgoing');
    }
}
