import { Head, router } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

type Warehouse = { id: number; name: string };
type Item = { product_id: number; name: string; sku: string; total_qty: number; total_revenue: number };
type Props = {
    items: Item[];
    warehouses: Warehouse[];
    filters: { from: string; to: string; warehouseId: number | null };
};

export default function TopSelling({ items, warehouses, filters }: Props) {
    function apply(overrides: Partial<typeof filters>) {
        router.get('/reports/top-selling', { ...filters, ...overrides }, { preserveState: true });
    }

    const chartData = items.slice(0, 15).map((i) => ({ name: i.name.slice(0, 20), qty: i.total_qty }));

    return (
        <>
            <Head title="Топ продаваемых" />
            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-semibold">Топ продаваемых товаров</h1>
                        <p className="mt-0.5 text-sm text-muted-foreground">По количеству проданных единиц</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Input type="date" value={filters.from} onChange={(e) => apply({ from: e.target.value })} className="w-36" />
                        <span className="text-muted-foreground">—</span>
                        <Input type="date" value={filters.to} onChange={(e) => apply({ to: e.target.value })} className="w-36" />
                        <Select value={filters.warehouseId ? String(filters.warehouseId) : ''} onValueChange={(v) => apply({ warehouseId: v ? Number(v) : null })}>
                            <SelectTrigger className="w-40">
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

                {items.length > 0 && (
                    <div className="rounded-xl border p-4">
                        <ResponsiveContainer width="100%" height={240}>
                            <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 40 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
                                <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-35} textAnchor="end" />
                                <YAxis tick={{ fontSize: 11 }} />
                                <Tooltip />
                                <Bar dataKey="qty" fill="var(--accent)" radius={[4, 4, 0, 0]} name="Продано" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}

                <div className="rounded-xl border">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b bg-muted/50">
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">#</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">SKU / Товар</th>
                                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Продано</th>
                                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Выручка</th>
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
                                    <td className="px-4 py-3 text-right tabular-nums">{Number(item.total_revenue).toLocaleString('ru-RU', { maximumFractionDigits: 0 })}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}

TopSelling.layout = {
    breadcrumbs: [
        { title: 'Дашборд', href: '/' },
        { title: 'Отчёты', href: '/reports' },
        { title: 'Топ продаваемых', href: '/reports/top-selling' },
    ],
};
