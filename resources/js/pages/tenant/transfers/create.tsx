import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Warehouse = { id: number; name: string };
type Product = { id: number; name: string; sku: string; unit: string };
type TransferLine = { product_id: number; quantity: string; product: Product };
type Props = { warehouses: Warehouse[]; products: Product[] };

export default function TransfersCreate({ warehouses, products }: Props) {
    const [form, setForm] = useState({
        date: new Date().toISOString().split('T')[0],
        from_warehouse_id: '',
        to_warehouse_id: '',
        note: '',
    });
    const [items, setItems] = useState<TransferLine[]>([]);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const productMap = Object.fromEntries(products.map((p) => [p.id, p]));

    function addItem(productId: number) {
        if (items.find((i) => i.product_id === productId)) { return; }
        setItems([...items, { product_id: productId, quantity: '1', product: productMap[productId] }]);
    }

    function removeItem(productId: number) {
        setItems(items.filter((i) => i.product_id !== productId));
    }

    function updateQty(productId: number, qty: string) {
        setItems(items.map((i) => i.product_id === productId ? { ...i, quantity: qty } : i));
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (items.length === 0) { return; }
        setProcessing(true);
        router.post('/transfers', {
            ...form,
            items: items.map((i) => ({ product_id: i.product_id, quantity: i.quantity })),
        }, {
            onError: (err) => { setErrors(err); setProcessing(false); },
        });
    }

    const [searchProduct, setSearchProduct] = useState('');
    const filteredProducts = products.filter((p) =>
        !items.find((i) => i.product_id === p.id) &&
        (p.name.toLowerCase().includes(searchProduct.toLowerCase()) || p.sku.toLowerCase().includes(searchProduct.toLowerCase()))
    );

    return (
        <>
            <Head title="Новое перемещение" />
            <div className="mx-auto max-w-2xl p-6">
                <div className="mb-6">
                    <h1 className="text-lg font-semibold">Новое перемещение</h1>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    {/* Шапка */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="date">Дата</Label>
                            <Input
                                id="date"
                                type="date"
                                value={form.date}
                                onChange={(e) => setForm({ ...form, date: e.target.value })}
                            />
                        </div>
                        <div className="col-span-2 grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <Label>Откуда</Label>
                                <Select value={form.from_warehouse_id} onValueChange={(v) => setForm({ ...form, from_warehouse_id: v })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Склад-источник" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {warehouses.map((w) => (
                                            <SelectItem key={w.id} value={String(w.id)}>{w.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.from_warehouse_id && <p className="text-xs text-destructive">{errors.from_warehouse_id}</p>}
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label>Куда</Label>
                                <Select value={form.to_warehouse_id} onValueChange={(v) => setForm({ ...form, to_warehouse_id: v })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Склад-получатель" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {warehouses
                                            .filter((w) => String(w.id) !== form.from_warehouse_id)
                                            .map((w) => (
                                                <SelectItem key={w.id} value={String(w.id)}>{w.name}</SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                                {errors.to_warehouse_id && <p className="text-xs text-destructive">{errors.to_warehouse_id}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Товары */}
                    <div className="flex flex-col gap-3">
                        <Label>Товары</Label>
                        <div className="flex gap-2">
                            <Input
                                placeholder="Поиск по названию или SKU..."
                                value={searchProduct}
                                onChange={(e) => setSearchProduct(e.target.value)}
                            />
                        </div>
                        {searchProduct && filteredProducts.length > 0 && (
                            <div className="max-h-48 overflow-y-auto rounded-lg border">
                                {filteredProducts.slice(0, 10).map((p) => (
                                    <button
                                        key={p.id}
                                        type="button"
                                        className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-muted/50"
                                        onClick={() => { addItem(p.id); setSearchProduct(''); }}
                                    >
                                        <Plus className="size-3 shrink-0 text-muted-foreground" />
                                        <span className="font-mono text-xs text-muted-foreground">{p.sku}</span>
                                        <span className="text-sm">{p.name}</span>
                                    </button>
                                ))}
                            </div>
                        )}

                        {items.length > 0 && (
                            <div className="rounded-xl border">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b bg-muted/50">
                                            <th className="px-3 py-2 text-left font-medium text-muted-foreground">Товар</th>
                                            <th className="px-3 py-2 text-center font-medium text-muted-foreground">Кол-во</th>
                                            <th className="w-10 px-3 py-2"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map((item) => (
                                            <tr key={item.product_id} className="border-b last:border-0">
                                                <td className="px-3 py-2">
                                                    <div className="font-mono text-xs text-muted-foreground">{item.product.sku}</div>
                                                    <div>{item.product.name}</div>
                                                </td>
                                                <td className="px-3 py-2">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <Input
                                                            type="number"
                                                            min="0.001"
                                                            step="0.001"
                                                            value={item.quantity}
                                                            onChange={(e) => updateQty(item.product_id, e.target.value)}
                                                            className="h-7 w-24 text-center"
                                                        />
                                                        <span className="text-xs text-muted-foreground">{item.product.unit}</span>
                                                    </div>
                                                </td>
                                                <td className="px-3 py-2">
                                                    <Button type="button" variant="ghost" size="icon" className="size-7 text-destructive hover:text-destructive" onClick={() => removeItem(item.product_id)}>
                                                        <Trash2 className="size-3" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        {errors.items && <p className="text-xs text-destructive">{errors.items}</p>}
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="note">Комментарий</Label>
                        <Input id="note" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Необязательно" />
                    </div>

                    <div className="flex gap-2">
                        <Button type="submit" disabled={processing || items.length === 0 || !form.from_warehouse_id || !form.to_warehouse_id}>
                            Сохранить
                        </Button>
                        <Button type="button" variant="outline" onClick={() => router.get('/transfers')}>
                            Отмена
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}

TransfersCreate.layout = {
    breadcrumbs: [
        { title: 'Дашборд', href: '/' },
        { title: 'Перемещения', href: '/transfers' },
        { title: 'Новое', href: '/transfers/create' },
    ],
};
