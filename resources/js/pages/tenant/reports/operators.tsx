import { Head, router } from '@inertiajs/react';
import { Input } from '@/components/ui/input';

type Row = { name: string; documents_count: number; total_revenue: number };
type Props = { data: Row[]; filters: { from: string; to: string } };

export default function OperatorsReport({ data, filters }: Props) {
    function apply(overrides: Partial<typeof filters>) {
        router.get('/reports/operators', { ...filters, ...overrides }, { preserveState: true });
    }

    return (
        <>
            <Head title="Работа операторов" />
            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-semibold">Работа операторов</h1>
                        <p className="mt-0.5 text-sm text-muted-foreground">Статистика по каждому сотруднику</p>
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
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Оператор</th>
                                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Продаж</th>
                                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Выручка</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                                        Нет данных за выбранный период
                                    </td>
                                </tr>
                            ) : data.map((row, idx) => (
                                <tr key={idx} className="border-b last:border-0 hover:bg-muted/30">
                                    <td className="px-4 py-3 font-medium">{row.name}</td>
                                    <td className="px-4 py-3 text-right tabular-nums">{row.documents_count}</td>
                                    <td className="px-4 py-3 text-right tabular-nums">{Number(row.total_revenue || 0).toLocaleString('ru-RU', { maximumFractionDigits: 0 })}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}

OperatorsReport.layout = {
    breadcrumbs: [
        { title: 'Дашборд', href: '/' },
        { title: 'Отчёты', href: '/reports' },
        { title: 'Операторы', href: '/reports/operators' },
    ],
};
