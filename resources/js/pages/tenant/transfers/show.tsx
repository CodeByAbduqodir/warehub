import { Head, router } from '@inertiajs/react';
import { ArrowRightLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Product = { id: number; name: string; sku: string; unit: string };
type Item = { id: number; product: Product; quantity: string };
type Document = {
    id: number;
    number: string;
    date: string;
    status: 'draft' | 'confirmed';
    note: string | null;
    from_warehouse: { id: number; name: string };
    to_warehouse: { id: number; name: string };
    user: { id: number; name: string } | null;
    items: Item[];
    confirmed_at: string | null;
};
type Props = { document: Document };

export default function TransfersShow({ document: doc }: Props) {
    function handleConfirm() {
        if (!confirm('Провести перемещение? Остатки на складах будут изменены.')) { return; }
        router.post(`/transfers/${doc.id}/confirm`);
    }

    return (
        <>
            <Head title={`Перемещение ${doc.number}`} />
            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="font-mono text-lg font-semibold">{doc.number}</h1>
                            {doc.status === 'confirmed' ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                                    <CheckCircle className="size-3" />
                                    Проведён
                                </span>
                            ) : (
                                <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
                                    Черновик
                                </span>
                            )}
                        </div>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                            {new Date(doc.date).toLocaleDateString('ru-RU')}
                            {doc.user && ` · ${doc.user.name}`}
                        </p>
                    </div>
                    {doc.status === 'draft' && (
                        <Button onClick={handleConfirm}>
                            <CheckCircle className="mr-2 size-4" />
                            Провести
                        </Button>
                    )}
                </div>

                {/* Маршрут */}
                <div className="flex items-center gap-3 rounded-xl border p-4">
                    <div className="flex-1 text-center">
                        <div className="text-xs text-muted-foreground">Откуда</div>
                        <div className="font-medium">{doc.from_warehouse.name}</div>
                    </div>
                    <ArrowRightLeft className="size-5 shrink-0 text-muted-foreground" />
                    <div className="flex-1 text-center">
                        <div className="text-xs text-muted-foreground">Куда</div>
                        <div className="font-medium">{doc.to_warehouse.name}</div>
                    </div>
                </div>

                {doc.note && (
                    <div className="rounded-lg bg-muted/50 px-4 py-2 text-sm text-muted-foreground">
                        {doc.note}
                    </div>
                )}

                {/* Таблица товаров */}
                <div className="rounded-xl border">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b bg-muted/50">
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">SKU / Товар</th>
                                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Количество</th>
                            </tr>
                        </thead>
                        <tbody>
                            {doc.items.map((item) => (
                                <tr key={item.id} className="border-b last:border-0">
                                    <td className="px-4 py-3">
                                        <div className="font-mono text-xs text-muted-foreground">{item.product.sku}</div>
                                        <div className="font-medium">{item.product.name}</div>
                                    </td>
                                    <td className="px-4 py-3 text-right tabular-nums">
                                        {parseFloat(item.quantity)} {item.product.unit}
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

TransfersShow.layout = {
    breadcrumbs: [
        { title: 'Дашборд', href: '/' },
        { title: 'Перемещения', href: '/transfers' },
        { title: 'Документ', href: '#' },
    ],
};
