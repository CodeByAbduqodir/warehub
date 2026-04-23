import { Head, router } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowDown, ArrowUp } from 'lucide-react';

type Product = { id: number; name: string; sku: string };
type Movement = { date: string; number: string; type: 'in' | 'out'; quantity: number; price: number };
type Props = {
    movements: Movement[];
    products: Product[];
    filters: { productId: number | null; from: string; to: string };
};

export default function MovementsReport({ movements, products, filters }: Props) {
    function apply(overrides: Partial<typeof filters>) {
        router.get('/reports/movements', { ...filters, ...overrides }, { preserveState: true });
    }

    const totalIn = movements.filter((m) => m.type === 'in').reduce((s, m) => s + Number(m.quantity), 0);
    const totalOut = movements.filter((m) => m.type === 'out').reduce((s, m) => s + Number(m.quantity), 0);

    return (
        <>
            <Head title="Движение товара" />
            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-semibold">Движение товара</h1>
                        {filters.productId && (
                            <p className="mt-0.5 text-sm text-muted-foreground">
                                Приход: +{totalIn.toLocaleString('ru-RU', { maximumFractionDigits: 3 })} · Расход: −{totalOut.toLocaleString('ru-RU', { maximumFractionDigits: 3 })}
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <Select value={filters.productId ? String(filters.productId) : ''} onValueChange={(v) => apply({ productId: v ? Number(v) : null })}>
                            <SelectTrigger className="w-56">
                                <SelectValue placeholder="Выберите товар" />
                            </SelectTrigger>
                            <SelectContent>
                                {products.map((p) => (
                                    <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Input type="date" value={filters.from} onChange={(e) => apply({ from: e.target.value })} className="w-36" />
                        <span className="text-muted-foreground">—</span>
                        <Input type="date" value={filters.to} onChange={(e) => apply({ to: e.target.value })} className="w-36" />
                    </div>
                </div>

                {!filters.productId ? (
                    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-16 text-center">
                        <p className="text-sm text-muted-foreground">Выберите товар для отображения движений</p>
                    </div>
                ) : movements.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-16 text-center">
                        <p className="text-sm text-muted-foreground">Движений за выбранный период нет</p>
                    </div>
                ) : (
                    <div className="rounded-xl border">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b bg-muted/50">
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Дата</th>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Документ</th>
                                    <th className="px-4 py-3 text-center font-medium text-muted-foreground">Тип</th>
                                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Количество</th>
                                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Цена</th>
                                </tr>
                            </thead>
                            <tbody>
                                {movements.map((m, idx) => (
                                    <tr key={idx} className="border-b last:border-0 hover:bg-muted/30">
                                        <td className="px-4 py-3 tabular-nums text-muted-foreground">
                                            {new Date(m.date).toLocaleDateString('ru-RU')}
                                        </td>
                                        <td className="px-4 py-3 font-mono text-xs">{m.number}</td>
                                        <td className="px-4 py-3 text-center">
                                            {m.type === 'in' ? (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800">
                                                    <ArrowDown className="size-3" /> Приход
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-800">
                                                    <ArrowUp className="size-3" /> Расход
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right tabular-nums">
                                            <span className={m.type === 'in' ? 'text-green-600' : 'text-destructive'}>
                                                {m.type === 'in' ? '+' : '−'}{Number(m.quantity).toLocaleString('ru-RU', { maximumFractionDigits: 3 })}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                                            {Number(m.price).toLocaleString('ru-RU', { maximumFractionDigits: 0 })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
    );
}

MovementsReport.layout = {
    breadcrumbs: [
        { title: 'Дашборд', href: '/' },
        { title: 'Отчёты', href: '/reports' },
        { title: 'Движение товара', href: '/reports/movements' },
    ],
};
