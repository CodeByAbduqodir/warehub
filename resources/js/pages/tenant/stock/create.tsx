import { Head, Link, Form } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Product = { id: number; name: string; unit: string };
type Warehouse = { id: number; name: string };

type Props = {
    products: Product[];
    warehouses: Warehouse[];
};

export default function StockCreate({ products, warehouses }: Props) {
    return (
        <>
            <Head title="Добавить товар на склад" />
            <div className="mx-auto max-w-lg p-6">
                <h1 className="mb-6 text-lg font-semibold">Добавить товар на склад</h1>

                <Form action="/stock" method="post" className="flex flex-col gap-5">
                    {({ errors, processing }) => (
                        <>
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="product_id">Вид товара *</Label>
                                <Select name="product_id">
                                    <SelectTrigger id="product_id">
                                        <SelectValue placeholder="Выберите вид товара" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {products.map((p) => (
                                            <SelectItem key={p.id} value={String(p.id)}>
                                                {p.name} ({p.unit})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.product_id && <p className="text-xs text-destructive">{errors.product_id}</p>}
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="warehouse_id">Склад *</Label>
                                <Select name="warehouse_id">
                                    <SelectTrigger id="warehouse_id">
                                        <SelectValue placeholder="Выберите склад" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {warehouses.map((w) => (
                                            <SelectItem key={w.id} value={String(w.id)}>
                                                {w.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.warehouse_id && <p className="text-xs text-destructive">{errors.warehouse_id}</p>}
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="quantity">Количество *</Label>
                                <Input
                                    id="quantity"
                                    name="quantity"
                                    type="number"
                                    min="0"
                                    step="0.001"
                                    defaultValue="1"
                                />
                                {errors.quantity && <p className="text-xs text-destructive">{errors.quantity}</p>}
                            </div>

                            <p className="text-xs text-muted-foreground">
                                Если этот товар уже есть на выбранном складе, количество прибавится к существующему.
                            </p>

                            <div className="flex items-center gap-3 pt-2">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Добавляем...' : 'Добавить на склад'}
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link href="/stock">Отмена</Link>
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

StockCreate.layout = {
    breadcrumbs: [
        { title: 'Дашборд', href: '/' },
        { title: 'Инвентарь', href: '/stock' },
        { title: 'Добавить товар', href: '/stock/create' },
    ],
};
