import { Head, router } from '@inertiajs/react';
import { Input } from '@/components/ui/input';

type Item = {
    product_id: number;
    name: string;
    sku: string;
    total_qty: number;
    revenue: number;
    cost: number;
    profit: number;
};
type Props = {
    items: Item[];
    filters: { from: string; to: string };
};

export default function TopProfitable({ items, filters }: Props) {
    function apply(overrides: Partial<typeof filters>) {
        router.get('/reports/top-profitable', { ...filters, ...overrides }, { preserveState: true });
    }

    const totalProfit = items.reduce((sum, i) => sum + Number(i.profit), 0);

    return (
        <>
            <Head title="Топ прибыльных" />
            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-semibold">Топ прибыльных товаров</h1>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                            Итого прибыль: {totalProfit.toLocaleString('ru-RU', { maximumFractionDigits: 0 })}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Input type="date" value={filters.from} onChange={(e) => apply({ from: e.target.value })} className="w-36" />
                        <span className="text-muted-foreground">—</span>
                        <Input type="date" value={filters.to} onChange={(e) => apply({ to: e.target.value })} className="w-36" />
                    </div>
                </div>

                <div className="rounded-xl border">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b bg-muted/50">
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">#</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">SKU / Товар</th>
                                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Продано</th>
                                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Выручка</th>
                                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Себестоимость</th>
                                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Прибыль</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, idx) => (
                                <tr key={item.product_id} className="border-b last:border-0 hover:bg-muted/30">
                                    <td className="px-4 py-3 text-muted-foreground tabular-nums">{idx + 1}</td>
                                    <td className="px-4 py-3">
                                        <div className="font-mono text-xs text-muted-foreground">{item.sku}</div>
                                        <div className="font-medium">{item.name}</div>
                                    </td>
                                    <td className="px-4 py-3 text-right tabular-nums">{Number(item.total_qty).toLocaleString('ru-RU', { maximumFractionDigits: 3 })}</td>
                                    <td className="px-4 py-3 text-right tabular-nums">{Number(item.revenue).toLocaleString('ru-RU', { maximumFractionDigits: 0 })}</td>
                                    <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{Number(item.cost).toLocaleString('ru-RU', { maximumFractionDigits: 0 })}</td>
                                    <td className="px-4 py-3 text-right tabular-nums font-medium text-green-600">
                                        {Number(item.profit).toLocaleString('ru-RU', { maximumFractionDigits: 0 })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}

TopProfitable.layout = {
    breadcrumbs: [
        { title: 'Дашборд', href: '/' },
        { title: 'Отчёты', href: '/reports' },
        { title: 'Топ прибыльных', href: '/reports/top-profitable' },
    ],
};
