import { Head, router } from '@inertiajs/react';
import { ChevronDown, CircleAlert, PackageX } from 'lucide-react';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@warehub/ui';

type Warehouse = { id: number; name: string };
type StockAlert = {
    id: number;
    name: string;
    sku: string;
    unit: string;
    available_quantity: string | null;
};
type StockItem = {
    id: number;
    quantity: string;
    product: {
        id: number;
        name: string;
        sku: string;
        unit: string;
        category: { name: string } | null;
    };
    warehouse: { id: number; name: string };
};
type Props = {
    items: StockItem[];
    outOfStock: StockAlert[];
    lowStock: StockAlert[];
    warehouses: Warehouse[];
    filters: { warehouse_id: number | null };
};

export default function StockSnapshot({
    items,
    outOfStock,
    lowStock,
    warehouses,
    filters,
}: Props) {
    function applyFilter(warehouseId: string) {
        router.get(
            '/reports/stock-snapshot',
            { warehouse_id: warehouseId || undefined },
            { preserveState: true },
        );
    }

    const totalQty = items.reduce((sum, i) => sum + parseFloat(i.quantity), 0);

    return (
        <>
            <Head title="Остатки на складе" />
            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-semibold">
                            Остатки на складе
                        </h1>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                            {items.length} позиций
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Select
                            value={
                                filters.warehouse_id
                                    ? String(filters.warehouse_id)
                                    : ''
                            }
                            onValueChange={applyFilter}
                        >
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="Все склады" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">Все склады</SelectItem>
                                {warehouses.map((w) => (
                                    <SelectItem key={w.id} value={String(w.id)}>
                                        {w.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                    <StockAlertPanel
                        items={outOfStock}
                        title="Нет в наличии"
                        description="Товары, у которых остаток закончился"
                        emptyMessage="Все товары есть в наличии"
                        icon={PackageX}
                        tone="danger"
                    />
                    <StockAlertPanel
                        items={lowStock}
                        title="Мало на складе"
                        description="Осталось от 1 до 20 единиц"
                        emptyMessage="Товаров с низким остатком нет"
                        icon={CircleAlert}
                        tone="warning"
                    />
                </div>

                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-16 text-center">
                        <p className="text-sm text-muted-foreground">
                            Нет остатков по выбранному складу
                        </p>
                    </div>
                ) : (
                    <div className="rounded-xl border">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b bg-muted/50">
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                        SKU / Товар
                                    </th>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                        Категория
                                    </th>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                        Склад
                                    </th>
                                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                                        Остаток
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="border-b last:border-0 hover:bg-muted/30"
                                    >
                                        <td className="px-4 py-3">
                                            <div className="font-mono text-xs text-muted-foreground">
                                                {item.product.sku}
                                            </div>
                                            <div className="font-medium">
                                                {item.product.name}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">
                                            {item.product.category?.name ?? '—'}
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">
                                            {item.warehouse.name}
                                        </td>
                                        <td className="px-4 py-3 text-right font-medium tabular-nums">
                                            {parseFloat(
                                                item.quantity,
                                            ).toLocaleString('ru-RU', {
                                                maximumFractionDigits: 3,
                                            })}{' '}
                                            {item.product.unit}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="border-t bg-muted/30">
                                    <td
                                        colSpan={3}
                                        className="px-4 py-2 text-sm font-medium text-muted-foreground"
                                    >
                                        Итого позиций: {items.length}
                                    </td>
                                    <td className="px-4 py-2 text-right text-sm font-medium tabular-nums">
                                        {totalQty.toLocaleString('ru-RU', {
                                            maximumFractionDigits: 3,
                                        })}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                )}
            </div>
        </>
    );
}

type StockAlertPanelProps = {
    items: StockAlert[];
    title: string;
    description: string;
    emptyMessage: string;
    icon: typeof PackageX;
    tone: 'danger' | 'warning';
};

function StockAlertPanel({
    items,
    title,
    description,
    emptyMessage,
    icon: Icon,
    tone,
}: StockAlertPanelProps) {
    const isDanger = tone === 'danger';
    const panelClassName = isDanger
        ? 'border-red-200 bg-red-50/70 dark:border-red-950 dark:bg-red-950/20'
        : 'border-orange-200 bg-orange-50/70 dark:border-orange-950 dark:bg-orange-950/20';
    const iconClassName = isDanger
        ? 'bg-red-100 text-red-600 dark:bg-red-950/70 dark:text-red-300'
        : 'bg-orange-100 text-orange-700 dark:bg-orange-950/70 dark:text-orange-300';
    const countClassName = isDanger
        ? 'bg-red-600 text-white'
        : 'bg-orange-500 text-white';

    return (
        <Collapsible defaultOpen={items.length > 0} className={`overflow-hidden rounded-xl border ${panelClassName}`}>
            <CollapsibleTrigger className="group flex w-full items-center gap-3 px-4 py-4 text-left outline-none transition-colors hover:bg-black/[0.02] focus-visible:ring-2 focus-visible:ring-ring">
                <span className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${iconClassName}`}>
                    <Icon className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                    <span className="block font-semibold">{title}</span>
                    <span className="mt-0.5 block text-sm text-muted-foreground">
                        {description}
                    </span>
                </span>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums ${countClassName}`}>
                    {items.length}
                </span>
                <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent className="border-t border-black/5">
                {items.length === 0 ? (
                    <p className="px-4 py-4 text-sm text-muted-foreground">
                        {emptyMessage}
                    </p>
                ) : (
                    <ul className="max-h-64 divide-y divide-black/5 overflow-y-auto bg-background/40">
                        {items.map((item) => (
                            <li key={item.id} className="flex items-center justify-between gap-4 px-4 py-3">
                                <span className="min-w-0">
                                    <span className="block truncate font-medium">{item.name}</span>
                                    <span className="block font-mono text-xs text-muted-foreground">
                                        {item.sku}
                                    </span>
                                </span>
                                <span className="shrink-0 text-sm font-semibold tabular-nums">
                                    {Number(item.available_quantity ?? 0).toLocaleString('ru-RU', {
                                        maximumFractionDigits: 3,
                                    })}{' '}
                                    {item.unit}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </CollapsibleContent>
        </Collapsible>
    );
}

StockSnapshot.layout = {
    breadcrumbs: [
        { title: 'Дашборд', href: '/' },
        { title: 'Отчёты', href: '/reports' },
        { title: 'Остатки', href: '/reports/stock-snapshot' },
    ],
};
