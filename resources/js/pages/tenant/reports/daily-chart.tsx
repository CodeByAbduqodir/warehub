import { Head, router } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Legend,
} from 'recharts';

type Props = {
    incoming: Record<string, number>;
    outgoing: Record<string, number>;
    filters: { from: string; to: string };
};

export default function DailyChart({ incoming, outgoing, filters }: Props) {
    function apply(overrides: Partial<typeof filters>) {
        router.get('/reports/daily-chart', { ...filters, ...overrides }, { preserveState: true });
    }

    const allDates = [...new Set([...Object.keys(incoming), ...Object.keys(outgoing)])].sort();
    const chartData = allDates.map((date) => ({
        date: new Date(date).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }),
        Приход: incoming[date] ?? 0,
        Расход: outgoing[date] ?? 0,
    }));

    return (
        <>
            <Head title="График по дням" />
            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-semibold">Движение товаров по дням</h1>
                        <p className="mt-0.5 text-sm text-muted-foreground">Количество документов в разбивке по дням</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Input type="date" value={filters.from} onChange={(e) => apply({ from: e.target.value })} className="w-36" />
                        <span className="text-muted-foreground">—</span>
                        <Input type="date" value={filters.to} onChange={(e) => apply({ to: e.target.value })} className="w-36" />
                    </div>
                </div>

                <div className="rounded-xl border p-4">
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
                            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="Приход" stroke="#1A1A1A" strokeWidth={2} dot={false} />
                            <Line type="monotone" dataKey="Расход" stroke="var(--accent)" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </>
    );
}

DailyChart.layout = {
    breadcrumbs: [
        { title: 'Дашборд', href: '/' },
        { title: 'Отчёты', href: '/reports' },
        { title: 'График по дням', href: '/reports/daily-chart' },
    ],
};
