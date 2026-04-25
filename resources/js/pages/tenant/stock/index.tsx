import { Head, Link, router } from '@inertiajs/react';
import { Boxes, Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

type StockItem = {
    id: number;
    quantity: string;
    reserved: string;
    product: { id: number; name: string; unit: string };
    warehouse: { id: number; name: string };
};

type PaginatedStock = {
    data: StockItem[];
    current_page: number;
    last_page: number;
    total: number;
};

type Props = {
    stock: PaginatedStock;
};

export default function StockIndex({ stock }: Props) {
    function handleDelete(item: StockItem) {
        if (confirm(`Удалить "${item.product.name}" со склада "${item.warehouse.name}"?`)) {
            router.delete(`/stock/${item.id}`);
        }
    }

    return (
        <>
            <Head title="Инвентарь" />
            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-semibold">Инвентарь</h1>
                        <p className="mt-0.5 text-sm text-muted-foreground">{stock.total} позиций на складах</p>
                    </div>
                    <Button asChild>
                        <Link href="/stock/create">
                            <Plus className="mr-2 size-4" />
                            Добавить товар
                        </Link>
                    </Button>
                </div>

                {stock.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-16 text-center">
                        <Boxes className="size-8 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">На складах пока нет товаров</p>
                        <Button asChild size="sm">
                            <Link href="/stock/create">Добавить первый товар</Link>
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className="rounded-xl border">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Вид товара</th>
                                        <th className="px-4 py-3 text-left font-medium text-muted-foreground">Склад</th>
                                        <th className="px-4 py-3 text-right font-medium text-muted-foreground">Количество</th>
                                        <th className="px-4 py-3 text-right font-medium text-muted-foreground">Доступно</th>
                                        <th className="px-4 py-3"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stock.data.map((item) => {
                                        const available = Number(item.quantity) - Number(item.reserved);
                                        return (
                                            <tr key={item.id} className="border-b last:border-0 hover:bg-muted/30">
                                                <td className="px-4 py-3 font-medium">{item.product.name}</td>
                                                <td className="px-4 py-3 text-muted-foreground">{item.warehouse.name}</td>
                                                <td className="px-4 py-3 text-right tabular-nums">
                                                    {Number(item.quantity).toLocaleString()} {item.product.unit}
                                                </td>
                                                <td className="px-4 py-3 text-right tabular-nums">
                                                    <span className={available < 0 ? 'text-destructive' : 'text-muted-foreground'}>
                                                        {available.toLocaleString()} {item.product.unit}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button variant="ghost" size="icon" asChild>
                                                            <Link href={`/stock/${item.id}/edit`}>
                                                                <Pencil className="size-4" />
                                                            </Link>
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-destructive hover:text-destructive"
                                                            onClick={() => handleDelete(item)}
                                                        >
                                                            <Trash2 className="size-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {stock.last_page > 1 && (
                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                                <span>Страница {stock.current_page} из {stock.last_page}</span>
                                <div className="flex gap-2">
                                    {stock.current_page > 1 && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => router.get('/stock', { page: stock.current_page - 1 })}
                                        >
                                            Назад
                                        </Button>
                                    )}
                                    {stock.current_page < stock.last_page && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => router.get('/stock', { page: stock.current_page + 1 })}
                                        >
                                            Вперёд
                                        </Button>
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

StockIndex.layout = {
    breadcrumbs: [
        { title: 'Дашборд', href: '/' },
        { title: 'Инвентарь', href: '/stock' },
    ],
};
