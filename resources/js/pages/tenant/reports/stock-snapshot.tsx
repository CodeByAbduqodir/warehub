import { Head, router } from '@inertiajs/react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

type Warehouse = { id: number; name: string };
type StockItem = {
    id: number;
    quantity: string;
    product: { id: number; name: string; sku: string; unit: string; category: { name: string } | null };
    warehouse: { id: number; name: string };
};
type Props = {
    items: StockItem[];
    warehouses: Warehouse[];
    filters: { warehouse_id: number | null };
};

export default function StockSnapshot({ items, warehouses, filters }: Props) {
    function applyFilter(warehouseId: string) {
        router.get('/reports/stock-snapshot', { warehouse_id: warehouseId || undefined }, { preserveState: true });
    }

    const totalQty = items.reduce((sum, i) => sum + parseFloat(i.quantity), 0);

    return (
        <>
            <Head title="Остатки на складе" />
            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-semibold">Остатки на складе</h1>
                        <p className="mt-0.5 text-sm text-muted-foreground">{items.length} позиций</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Select
                            value={filters.warehouse_id ? String(filters.warehouse_id) : ''}
                            onValueChange={applyFilter}
                        >
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="Все склады" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">Все склады</SelectItem>
                                {warehouses.map((w) => (
                                    <SelectItem key={w.id} value={String(w.id)}>{w.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-16 text-center">
                        <p className="text-sm text-muted-foreground">Нет остатков по выбранному складу</p>
                    </div>
                ) : (
                    <div className="rounded-xl border">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b bg-muted/50">
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">SKU / Товар</th>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Категория</th>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Склад</th>
                                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Остаток</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item) => (
                                    <tr key={item.id} className="border-b last:border-0 hover:bg-muted/30">
                                        <td className="px-4 py-3">
                                            <div className="font-mono text-xs text-muted-foreground">{item.product.sku}</div>
                                            <div className="font-medium">{item.product.name}</div>
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">
                                            {item.product.category?.name ?? '—'}
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">{item.warehouse.name}</td>
                                        <td className="px-4 py-3 text-right tabular-nums font-medium">
                                            {parseFloat(item.quantity).toLocaleString('ru-RU', { maximumFractionDigits: 3 })} {item.product.unit}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="border-t bg-muted/30">
                                    <td colSpan={3} className="px-4 py-2 text-sm font-medium text-muted-foreground">Итого позиций: {items.length}</td>
                                    <td className="px-4 py-2 text-right text-sm font-medium tabular-nums">{totalQty.toLocaleString('ru-RU', { maximumFractionDigits: 3 })}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                )}
            </div>
        </>
    );
}

StockSnapshot.layout = {
    breadcrumbs: [
        { title: 'Дашборд', href: '/' },
        { title: 'Отчёты', href: '/reports' },
        { title: 'Остатки', href: '/reports/stock-snapshot' },
    ],
};
