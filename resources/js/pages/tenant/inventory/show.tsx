import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Check, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Product = { id: number; name: string; sku: string; unit: string };
type Item = {
    id: number;
    product: Product;
    expected_qty: string;
    actual_qty: string | null;
};
type Document = {
    id: number;
    number: string;
    date: string;
    type: string;
    status: 'draft' | 'in_progress' | 'completed';
    note: string | null;
    warehouse: { id: number; name: string };
    user: { id: number; name: string } | null;
    items: Item[];
    confirmed_at: string | null;
};
type Props = { document: Document };

const TYPE_LABELS: Record<string, string> = {
    planned: 'Плановая',
    unplanned: 'Внеплановая',
    partial: 'Частичная',
};

export default function InventoryShow({ document: doc }: Props) {
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editValue, setEditValue] = useState('');
    const [processing, setProcessing] = useState(false);

    const checkedCount = doc.items.filter((i) => i.actual_qty !== null).length;
    const total = doc.items.length;
    const discrepancies = doc.items.filter(
        (i) => i.actual_qty !== null && parseFloat(i.actual_qty) !== parseFloat(i.expected_qty)
    ).length;

    function startEdit(item: Item) {
        if (doc.status === 'completed') { return; }
        setEditingId(item.id);
        setEditValue(item.actual_qty ?? item.expected_qty);
    }

    function saveEdit(item: Item) {
        if (editValue === '') { return; }
        setProcessing(true);
        router.patch(`/inventory/${doc.id}/items/${item.id}`, { actual_qty: editValue }, {
            preserveScroll: true,
            onFinish: () => { setProcessing(false); setEditingId(null); },
        });
    }

    function handleConfirm() {
        if (!confirm('Провести инвентаризацию? Остатки на складе будут скорректированы.')) { return; }
        router.post(`/inventory/${doc.id}/confirm`);
    }

    return (
        <>
            <Head title={`Инвентаризация ${doc.number}`} />
            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="font-mono text-lg font-semibold">{doc.number}</h1>
                            {doc.status === 'completed' && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                                    <CheckCircle className="size-3" />
                                    Завершена
                                </span>
                            )}
                            {doc.status === 'in_progress' && (
                                <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                                    В процессе
                                </span>
                            )}
                        </div>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                            {TYPE_LABELS[doc.type]} · {doc.warehouse.name} · {new Date(doc.date).toLocaleDateString('ru-RU')}
                        </p>
                    </div>
                    {doc.status !== 'completed' && (
                        <Button onClick={handleConfirm} disabled={checkedCount === 0}>
                            <Check className="mr-2 size-4" />
                            Провести
                        </Button>
                    )}
                </div>

                {/* Прогресс */}
                <div className="rounded-xl border p-4">
                    <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Проверено</span>
                        <span className="font-medium">{checkedCount} / {total}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                            className="h-full rounded-full bg-[var(--accent)] transition-all"
                            style={{ width: total > 0 ? `${(checkedCount / total) * 100}%` : '0%' }}
                        />
                    </div>
                    {discrepancies > 0 && (
                        <p className="mt-2 text-xs text-destructive">
                            Расхождений: {discrepancies}
                        </p>
                    )}
                </div>

                {/* Таблица */}
                <div className="rounded-xl border">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b bg-muted/50">
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">SKU / Товар</th>
                                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Ожидаемо</th>
                                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Фактически</th>
                                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Разница</th>
                            </tr>
                        </thead>
                        <tbody>
                            {doc.items.map((item) => {
                                const diff = item.actual_qty !== null
                                    ? parseFloat(item.actual_qty) - parseFloat(item.expected_qty)
                                    : null;
                                const isEditing = editingId === item.id;

                                return (
                                    <tr
                                        key={item.id}
                                        className={`border-b last:border-0 hover:bg-muted/30 ${diff !== null && diff !== 0 ? 'bg-red-50/50' : ''}`}
                                    >
                                        <td className="px-4 py-3">
                                            <div className="font-mono text-xs text-muted-foreground">{item.product.sku}</div>
                                            <div className="font-medium">{item.product.name}</div>
                                        </td>
                                        <td className="px-4 py-3 text-center tabular-nums">
                                            {parseFloat(item.expected_qty)} {item.product.unit}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {isEditing ? (
                                                <div className="flex items-center justify-center gap-1">
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        step="0.001"
                                                        value={editValue}
                                                        onChange={(e) => setEditValue(e.target.value)}
                                                        className="h-7 w-24 text-center"
                                                        autoFocus
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') { saveEdit(item); }
                                                            if (e.key === 'Escape') { setEditingId(null); }
                                                        }}
                                                    />
                                                    <Button size="sm" className="h-7 px-2" onClick={() => saveEdit(item)} disabled={processing}>
                                                        <Check className="size-3" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => startEdit(item)}
                                                    className={`tabular-nums rounded px-2 py-0.5 transition-colors ${doc.status !== 'completed' ? 'cursor-pointer hover:bg-muted' : 'cursor-default'} ${item.actual_qty === null ? 'text-muted-foreground' : ''}`}
                                                >
                                                    {item.actual_qty !== null ? `${parseFloat(item.actual_qty)} ${item.product.unit}` : '—'}
                                                </button>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-center tabular-nums">
                                            {diff !== null ? (
                                                <span className={diff > 0 ? 'text-green-600' : diff < 0 ? 'text-destructive' : 'text-muted-foreground'}>
                                                    {diff > 0 ? '+' : ''}{diff}
                                                </span>
                                            ) : '—'}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}

InventoryShow.layout = {
    breadcrumbs: [
        { title: 'Дашборд', href: '/' },
        { title: 'Инвентаризация', href: '/inventory' },
        { title: 'Документ', href: '#' },
    ],
};
