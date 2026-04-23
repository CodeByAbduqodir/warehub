import { Head, router } from '@inertiajs/react';
import { Input } from '@/components/ui/input';

type Item = {
    product_id: number;
    name: string;
    sku: string;
    revenue: number;
    share: number;
    abc: 'A' | 'B' | 'C';
};
type Props = {
    items: Item[];
    filters: { from: string; to: string };
};

const ABC_CLASSES: Record<string, string> = {
    A: 'bg-green-100 text-green-800',
    B: 'bg-yellow-100 text-yellow-800',
    C: 'bg-gray-100 text-gray-600',
};

export default function AbcReport({ items, filters }: Props) {
    function apply(overrides: Partial<typeof filters>) {
        router.get('/reports/abc', { ...filters, ...overrides }, { preserveState: true });
    }

    const counts = { A: 0, B: 0, C: 0 };
    items.forEach((i) => counts[i.abc]++);

    return (
        <>
            <Head title="ABC-анализ" />
            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-semibold">ABC-анализ</h1>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                            A: {counts.A} товаров · B: {counts.B} · C: {counts.C}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Input type="date" value={filters.from} onChange={(e) => apply({ from: e.target.value })} className="w-36" />
                        <span className="text-muted-foreground">—</span>
                        <Input type="date" value={filters.to} onChange={(e) => apply({ to: e.target.value })} className="w-36" />
                    </div>
                </div>

                {/* Легенда */}
                <div className="grid grid-cols-3 gap-3">
                    {(['A', 'B', 'C'] as const).map((cat) => (
                        <div key={cat} className="rounded-xl border p-3">
                            <div className="flex items-center gap-2">
                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold ${ABC_CLASSES[cat]}`}>{cat}</span>
                                <span className="text-sm font-medium">{counts[cat]} товаров</span>
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {cat === 'A' && 'Даёт 80% выручки — приоритет'}
                                {cat === 'B' && 'Даёт 15% выручки — мониторинг'}
                                {cat === 'C' && 'Даёт 5% выручки — оптимизация'}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="rounded-xl border">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b bg-muted/50">
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">#</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">SKU / Товар</th>
                                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Выручка</th>
                                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Доля</th>
                                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Группа</th>
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
                                    <td className="px-4 py-3 text-right tabular-nums">{Number(item.revenue).toLocaleString('ru-RU', { maximumFractionDigits: 0 })}</td>
                                    <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{item.share}%</td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold ${ABC_CLASSES[item.abc]}`}>
                                            {item.abc}
                                        </span>
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

AbcReport.layout = {
    breadcrumbs: [
        { title: 'Дашборд', href: '/' },
        { title: 'Отчёты', href: '/reports' },
        { title: 'ABC-анализ', href: '/reports/abc' },
    ],
};
