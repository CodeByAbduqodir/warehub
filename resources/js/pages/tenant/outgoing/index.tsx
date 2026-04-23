import { Head, Link, router } from '@inertiajs/react';
import { Eye, Monitor, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Customer = { id: number; name: string };
type Warehouse = { id: number; name: string };
type Document = {
    id: number;
    number: string;
    date: string;
    status: 'draft' | 'confirmed';
    customer: Customer | null;
    warehouse: Warehouse;
    items_count: number;
};
type PaginatedDocuments = { data: Document[]; current_page: number; last_page: number; total: number };
type Props = { documents: PaginatedDocuments };

const STATUS_LABELS: Record<string, string> = { draft: 'Черновик', confirmed: 'Проведён' };
const STATUS_CLASSES: Record<string, string> = {
    draft: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-green-100 text-green-800',
};

export default function OutgoingIndex({ documents }: Props) {
    function handleDelete(doc: Document) {
        if (confirm(`Удалить документ ${doc.number}?`)) {
            router.delete(`/outgoing/${doc.id}`);
        }
    }

    return (
        <>
            <Head title="Продажи" />
            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-semibold">Продажи</h1>
                        <p className="mt-0.5 text-sm text-muted-foreground">{documents.total} документов</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href="/outgoing/pos">
                                <Monitor className="mr-2 size-4" />
                                POS-касса
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link href="/outgoing/create">
                                <Plus className="mr-2 size-4" />
                                Новая продажа
                            </Link>
                        </Button>
                    </div>
                </div>

                {documents.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-16 text-center">
                        <ShoppingCart className="size-8 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Документов продаж нет</p>
                        <Button asChild size="sm">
                            <Link href="/outgoing/create">Создать первую продажу</Link>
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className="rounded-xl border">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">№ / Дата</th>
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Клиент</th>
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Склад</th>
                                        <th className="px-4 py-3 text-center font-medium text-muted-foreground">Позиций</th>
                                        <th className="px-4 py-3 text-center font-medium text-muted-foreground">Статус</th>
                                        <th className="px-4 py-3 text-right font-medium text-muted-foreground"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {documents.data.map((doc) => (
                                        <tr key={doc.id} className="border-b last:border-0 hover:bg-muted/30">
                                            <td className="px-4 py-3">
                                                <div className="font-mono font-medium">{doc.number}</div>
                                                <div className="text-xs text-muted-foreground">{new Date(doc.date).toLocaleDateString('ru-RU')}</div>
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">{doc.customer?.name ?? '—'}</td>
                                            <td className="px-4 py-3 text-muted-foreground">{doc.warehouse.name}</td>
                                            <td className="px-4 py-3 text-center tabular-nums">{doc.items_count}</td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_CLASSES[doc.status]}`}>
                                                    {STATUS_LABELS[doc.status]}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button variant="ghost" size="icon" asChild>
                                                        <Link href={`/outgoing/${doc.id}`}><Eye className="size-4" /></Link>
                                                    </Button>
                                                    {doc.status === 'draft' && (
                                                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(doc)}>
                                                            <Trash2 className="size-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {documents.last_page > 1 && (
                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                                <span>Страница {documents.current_page} из {documents.last_page}</span>
                                <div className="flex gap-2">
                                    {documents.current_page > 1 && (
                                        <Button variant="outline" size="sm" onClick={() => router.get('/outgoing', { page: documents.current_page - 1 })}>Назад</Button>
                                    )}
                                    {documents.current_page < documents.last_page && (
                                        <Button variant="outline" size="sm" onClick={() => router.get('/outgoing', { page: documents.current_page + 1 })}>Вперёд</Button>
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </>
    );
}

OutgoingIndex.layout = {
    breadcrumbs: [{ title: 'Дашборд', href: '/' }, { title: 'Продажи', href: '/outgoing' }],
};
