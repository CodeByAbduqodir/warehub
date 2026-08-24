<?php

declare(strict_types=1);

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Http\Requests\Tenant\StoreOutgoingDocumentRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;
use Warehub\Core\Actions\Tenant\ConfirmOutgoingDocument;
use Warehub\Core\Models\Tenant\Customer;
use Warehub\Core\Models\Tenant\OutgoingDocument;
use Warehub\Core\Models\Tenant\Stock;
use Warehub\Core\Support\DocumentNumber;

class OutgoingDocumentController extends Controller
{
    public function posStore(StoreOutgoingDocumentRequest $request, ConfirmOutgoingDocument $action): RedirectResponse
    {
        $data = $request->validated();

        $document = OutgoingDocument::create([
            'number' => DocumentNumber::temporary(),
            'date' => $data['date'],
            'warehouse_id' => $data['warehouse_id'] ?? null,
            'user_id' => auth()->id(),
            'status' => 'draft',
        ]);
        DocumentNumber::assign($document, 'OUT');

        foreach ($data['items'] as $item) {
            $document->items()->create([
                'product_id' => $item['product_id'],
                'quantity' => $item['quantity'],
                'retail_price' => $item['retail_price'],
            ]);
        }

        $document->load('items.product');
        $action($document);

        return redirect('/outgoing/pos');
    }

    public function pos(): Response
    {
        return Inertia::render('tenant/outgoing/pos', [
            'customers' => Customer::orderBy('name')->get(['id', 'name']),
            'stock' => $this->availableStock(),
        ]);
    }

    /** @return Collection<int, array<string, mixed>> */
    private function availableStock(): Collection
    {
        return Stock::with('product:id,name,sku,barcode,unit,retail_price,currency')
            ->get()
            ->groupBy('product_id')
            ->map(function ($locations) {
                /** @var Stock $stock */
                $stock = $locations->first();

                return [
                    'product_id' => $stock->product_id,
                    'product_name' => $stock->product->name,
                    'product_sku' => $stock->product->sku,
                    'product_barcode' => $stock->product->barcode,
                    'unit' => $stock->product->unit,
                    'retail_price' => $stock->product->retail_price,
                    'currency' => $stock->product->currency,
                    'available' => $locations->sum(fn (Stock $location): float => max(0, $location->available())),
                ];
            })
            ->values();
    }
}
