import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Product = { id: number; name: string; sku: string | null; unit: string; currency: string };
type Item = { id: number; product: Product; quantity: string; retail_price: string };
type Customer = { id: number; name: string };
type Warehouse = { id: number; name: string };
type User = { id: number; name: string };
type Document = {
    id: number; number: string; date: string; status: 'draft' | 'confirmed';
    note: string | null; confirmed_at: string | null;
    customer: Customer | null; warehouse: Warehouse; user: User | null; items: Item[];
};
type Props = { document: Document };

const STATUS_LABELS: Record<string, string> = { draft: 'Черновик', confirmed: 'Проведён' };
const STATUS_CLASSES: Record<string, string> = { draft: 'bg-yellow-100 text-yellow-800', confirmed: 'bg-green-100 text-green-800' };

export default function OutgoingShow({ document: doc }: Props) {
    const totalAmount = doc.items.reduce((sum, item) => sum + parseFloat(item.quantity) * parseFloat(item.retail_price), 0);

    function handleConfirm() {
        if (confirm(`Провести документ ${doc.number}? Остатки на складе будут уменьшены.`)) {
            router.post(`/outgoing/${doc.id}/confirm`);
        }
    }

    return (
        <>
            <Head title={`Продажа ${doc.number}`} />
            <div className="mx-auto max-w-3xl p-6">
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="/outgoing"><ArrowLeft className="size-4" /></Link>
                        </Button>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="font-mono text-lg font-semibold">{doc.number}</h1>
                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_CLASSES[doc.status]}`}>
                                    {STATUS_LABELS[doc.status]}
                                </span>
                            </div>
                            <p className="text-sm text-muted-foreground">{new Date(doc.date).toLocaleDateString('ru-RU')}</p>
                        </div>
                    </div>
                    {doc.status === 'draft' && (
                        <Button onClick={handleConfirm}>
                            <CheckCircle2 className="mr-2 size-4" />
                            Провести
                        </Button>
                    )}
                </div>

                <div className="mb-6 grid grid-cols-2 gap-4 rounded-xl border p-4 text-sm">
                    <div><p className="text-muted-foreground">Склад</p><p className="font-medium">{doc.warehouse.name}</p></div>
                    <div><p className="text-muted-foreground">Клиент</p><p className="font-medium">{doc.customer?.name ?? '—'}</p></div>
                    {doc.user && <div><p className="text-muted-foreground">Создал</p><p className="font-medium">{doc.user.name}</p></div>}
                    {doc.confirmed_at && <div><p className="text-muted-foreground">Проведён</p><p className="font-medium">{new Date(doc.confirmed_at).toLocaleString('ru-RU')}</p></div>}
                    {doc.note && <div className="col-span-2"><p className="text-muted-foreground">Примечание</p><p className="font-medium">{doc.note}</p></div>}
                </div>

                <div className="rounded-xl border">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b bg-muted/50">
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Товар</th>
                                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Кол-во</th>
                                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Цена</th>
                                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Сумма</th>
                            </tr>
                        </thead>
                        <tbody>
                            {doc.items.map((item) => (
                                <tr key={item.id} className="border-b last:border-0">
                                    <td className="px-4 py-3">
                                        <div className="font-medium">{item.product.name}</div>
                                        {item.product.sku && <div className="font-mono text-xs text-muted-foreground">{item.product.sku}</div>}
                                    </td>
                                    <td className="px-4 py-3 text-right tabular-nums">{item.quantity} {item.product.unit}</td>
                                    <td className="px-4 py-3 text-right tabular-nums">{Number(item.retail_price).toLocaleString()}</td>
                                    <td className="px-4 py-3 text-right tabular-nums">
                                        {(parseFloat(item.quantity) * parseFloat(item.retail_price)).toLocaleString()} {item.product.currency}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="border-t bg-muted/30">
                                <td colSpan={3} className="px-4 py-3 text-right font-medium">Итого:</td>
                                <td className="px-4 py-3 text-right font-semibold tabular-nums">{totalAmount.toLocaleString()}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </>
    );
}

OutgoingShow.layout = {
    breadcrumbs: [{ title: 'Дашборд', href: '/' }, { title: 'Продажи', href: '/outgoing' }, { title: 'Документ', href: '#' }],
};
