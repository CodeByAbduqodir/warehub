import { Head } from '@inertiajs/react';
import { Form } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

type Category = { id: number; name: string };

type Props = {
    categories: Category[];
};

const UNITS = ['шт', 'кг', 'л', 'м', 'упаковка'];
const CURRENCIES = ['UZS', 'USD'];

export default function ProductCreate({ categories }: Props) {
    return (
        <>
            <Head title="Новый товар" />
            <div className="mx-auto max-w-2xl p-6">
                <h1 className="mb-6 text-lg font-semibold">Новый товар</h1>

                <Form action="/products" method="post" className="flex flex-col gap-5">
                    {({ errors, processing }) => (
                        <>
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="name">Название *</Label>
                                <Input id="name" name="name" autoFocus />
                                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="sku">SKU</Label>
                                    <Input id="sku" name="sku" placeholder="Авто" />
                                    {errors.sku && <p className="text-xs text-destructive">{errors.sku}</p>}
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="barcode">Штрихкод</Label>
                                    <Input id="barcode" name="barcode" />
                                    {errors.barcode && <p className="text-xs text-destructive">{errors.barcode}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="category_id">Категория</Label>
                                    <Select name="category_id">
                                        <SelectTrigger id="category_id">
                                            <SelectValue placeholder="Без категории" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((cat) => (
                                                <SelectItem key={cat.id} value={String(cat.id)}>
                                                    {cat.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.category_id && <p className="text-xs text-destructive">{errors.category_id}</p>}
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="brand">Бренд</Label>
                                    <Input id="brand" name="brand" />
                                    {errors.brand && <p className="text-xs text-destructive">{errors.brand}</p>}
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="unit">Единица измерения *</Label>
                                <Select name="unit" defaultValue="шт">
                                    <SelectTrigger id="unit">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {UNITS.map((u) => (
                                            <SelectItem key={u} value={u}>{u}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.unit && <p className="text-xs text-destructive">{errors.unit}</p>}
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="description">Описание</Label>
                                <Textarea id="description" name="description" rows={3} />
                                {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="purchase_price">Закупочная цена *</Label>
                                    <Input id="purchase_price" name="purchase_price" type="number" min="0" step="0.01" defaultValue="0" />
                                    {errors.purchase_price && <p className="text-xs text-destructive">{errors.purchase_price}</p>}
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="retail_price">Розничная цена *</Label>
                                    <Input id="retail_price" name="retail_price" type="number" min="0" step="0.01" defaultValue="0" />
                                    {errors.retail_price && <p className="text-xs text-destructive">{errors.retail_price}</p>}
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="currency">Валюта</Label>
                                    <Select name="currency" defaultValue="UZS">
                                        <SelectTrigger id="currency">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {CURRENCIES.map((c) => (
                                                <SelectItem key={c} value={c}>{c}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.currency && <p className="text-xs text-destructive">{errors.currency}</p>}
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="min_stock">Мин. остаток (для алерта)</Label>
                                <Input id="min_stock" name="min_stock" type="number" min="0" defaultValue="0" className="max-w-[160px]" />
                                {errors.min_stock && <p className="text-xs text-destructive">{errors.min_stock}</p>}
                            </div>

                            <div className="flex items-center gap-3 pt-2">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Сохраняем...' : 'Сохранить товар'}
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link href="/products">Отмена</Link>
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

ProductCreate.layout = {
    breadcrumbs: [
        { title: 'Дашборд', href: '/' },
        { title: 'Товары', href: '/products' },
        { title: 'Новый товар', href: '/products/create' },
    ],
};
