import { Head, Link, Form } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type StockItem = {
    id: number;
    quantity: string;
    product: { name: string; unit: string };
    warehouse: { name: string };
};

type Props = {
    stock: StockItem;
};

export default function StockEdit({ stock }: Props) {
    return (
        <>
            <Head title="Изменить количество" />
            <div className="mx-auto max-w-lg p-6">
                <h1 className="mb-1 text-lg font-semibold">Изменить количество</h1>
                <p className="mb-6 text-sm text-muted-foreground">
                    {stock.product.name} — {stock.warehouse.name}
                </p>

                <Form action={`/stock/${stock.id}`} method="patch" className="flex flex-col gap-5">
                    {({ errors, processing }) => (
                        <>
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="quantity">Количество ({stock.product.unit}) *</Label>
                                <Input
                                    id="quantity"
                                    name="quantity"
                                    type="number"
                                    min="0"
                                    step="0.001"
                                    defaultValue={stock.quantity}
                                    autoFocus
                                />
                                {errors.quantity && <p className="text-xs text-destructive">{errors.quantity}</p>}
                            </div>

                            <div className="flex items-center gap-3 pt-2">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Сохраняем...' : 'Сохранить'}
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

StockEdit.layout = {
    breadcrumbs: [
        { title: 'Дашборд', href: '/' },
        { title: 'Инвентарь', href: '/stock' },
        { title: 'Изменить', href: '#' },
    ],
};
