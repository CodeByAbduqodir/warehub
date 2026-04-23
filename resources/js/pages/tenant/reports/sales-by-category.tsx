import { Head, router } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

type CategoryRow = { category: string; revenue: number; qty: number };
type Props = {
    data: CategoryRow[];
    filters: { from: string; to: string };
};

const COLORS = ['#00BFFF', '#0088CC', '#33CCFF', '#66D9FF', '#99E6FF', '#CCF2FF', '#B3E0FF', '#80CCFF'];

export default function SalesByCategory({ data, filters }: Props) {
    function apply(overrides: Partial<typeof filters>) {
        router.get('/reports/sales-by-category', { ...filters, ...overrides }, { preserveState: true });
    }

    const totalRevenue = data.reduce((sum, d) => sum + Number(d.revenue), 0);
    const chartData = data.map((d) => ({ name: d.category, value: Number(d.revenue) }));

    return (
        <>
            <Head title="Продажи по категориям" />
            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-semibold">Продажи по категориям</h1>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                            Итого: {totalRevenue.toLocaleString('ru-RU', { maximumFractionDigits: 0 })}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Input type="date" value={filters.from} onChange={(e) => apply({ from: e.target.value })} className="w-36" />
                        <span className="text-muted-foreground">—</span>
                        <Input type="date" value={filters.to} onChange={(e) => apply({ to: e.target.value })} className="w-36" />
                    </div>
                </div>

                {data.length > 0 && (
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <div className="flex items-center justify-center rounded-xl border p-4">
                            <ResponsiveContainer width="100%" height={280}>
                                <PieChart>
                                    <Pie data={chartData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                                        {chartData.map((_, index) => (
                                            <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(v: number) => v.toLocaleString('ru-RU', { maximumFractionDigits: 0 })} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="rounded-xl border">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Категория</th>
                                        <th className="px-4 py-3 text-right font-medium text-muted-foreground">Выручка</th>
                                        <th className="px-4 py-3 text-right font-medium text-muted-foreground">Доля</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.map((row, idx) => (
                                        <tr key={idx} className="border-b last:border-0 hover:bg-muted/30">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="size-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                                                    {row.category}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-right tabular-nums">{Number(row.revenue).toLocaleString('ru-RU', { maximumFractionDigits: 0 })}</td>
                                            <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                                                {totalRevenue > 0 ? ((Number(row.revenue) / totalRevenue) * 100).toFixed(1) : 0}%
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

SalesByCategory.layout = {
    breadcrumbs: [
        { title: 'Дашборд', href: '/' },
        { title: 'Отчёты', href: '/reports' },
        { title: 'По категориям', href: '/reports/sales-by-category' },
    ],
};
