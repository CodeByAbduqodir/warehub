import { Head, Link } from '@inertiajs/react';
import { Form } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

type Category = { id: number; name: string };

type Product = {
    id: number;
    sku: string | null;
    barcode: string | null;
    name: string;
    brand: string | null;
    unit: string;
    purchase_price: string;
    retail_price: string;
    currency: string;
    min_stock: number;
    description: string | null;
    category_id: number | null;
};

type Props = {
    product: Product;
    categories: Category[];
};

const UNITS = ['шт', 'кг', 'л', 'м', 'упаковка'];
const CURRENCIES = ['UZS', 'USD'];

export default function ProductEdit({ product, categories }: Props) {
    return (
        <>
            <Head title={`Редактировать: ${product.name}`} />
            <div className="mx-auto max-w-2xl p-6">
                <h1 className="mb-6 text-lg font-semibold">Редактировать товар</h1>

                <Form action={`/products/${product.id}`} method="patch" className="flex flex-col gap-5">
                    {({ errors, processing }) => (
                        <>
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="name">Название *</Label>
                                <Input id="name" name="name" defaultValue={product.name} autoFocus />
                                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="sku">SKU</Label>
                                    <Input id="sku" name="sku" defaultValue={product.sku ?? ''} />
                                    {errors.sku && <p className="text-xs text-destructive">{errors.sku}</p>}
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="barcode">Штрихкод</Label>
                                    <Input id="barcode" name="barcode" defaultValue={product.barcode ?? ''} />
                                    {errors.barcode && <p className="text-xs text-destructive">{errors.barcode}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="category_id">Категория</Label>
                                    <Select name="category_id" defaultValue={product.category_id ? String(product.category_id) : undefined}>
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
                                    <Input id="brand" name="brand" defaultValue={product.brand ?? ''} />
                                    {errors.brand && <p className="text-xs text-destructive">{errors.brand}</p>}
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="unit">Единица измерения *</Label>
                                <Select name="unit" defaultValue={product.unit}>
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
                                <Textarea id="description" name="description" rows={3} defaultValue={product.description ?? ''} />
                                {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="purchase_price">Закупочная цена *</Label>
                                    <Input id="purchase_price" name="purchase_price" type="number" min="0" step="0.01" defaultValue={product.purchase_price} />
                                    {errors.purchase_price && <p className="text-xs text-destructive">{errors.purchase_price}</p>}
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="retail_price">Розничная цена *</Label>
                                    <Input id="retail_price" name="retail_price" type="number" min="0" step="0.01" defaultValue={product.retail_price} />
                                    {errors.retail_price && <p className="text-xs text-destructive">{errors.retail_price}</p>}
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="currency">Валюта</Label>
                                    <Select name="currency" defaultValue={product.currency}>
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
                                <Input id="min_stock" name="min_stock" type="number" min="0" defaultValue={product.min_stock} className="max-w-[160px]" />
                                {errors.min_stock && <p className="text-xs text-destructive">{errors.min_stock}</p>}
                            </div>

                            <div className="flex items-center gap-3 pt-2">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Сохраняем...' : 'Сохранить изменения'}
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

ProductEdit.layout = {
    breadcrumbs: [
        { title: 'Дашборд', href: '/' },
        { title: 'Товары', href: '/products' },
        { title: 'Редактировать', href: '#' },
    ],
};
