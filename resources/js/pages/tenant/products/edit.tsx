import { Head, Link, Form } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

type Product = {
    id: number;
    name: string;
    unit: string;
    retail_price: string;
    description: string | null;
};

type Props = {
    product: Product;
};

const UNITS = ['шт', 'кг', 'л', 'м', 'упаковка'];

export default function ProductEdit({ product }: Props) {
    return (
        <>
            <Head title={`Редактировать: ${product.name}`} />
            <div className="mx-auto max-w-lg p-6">
                <h1 className="mb-6 text-lg font-semibold">Редактировать вид товара</h1>

                <Form action={`/products/${product.id}`} method="patch" className="flex flex-col gap-5">
                    {({ errors, processing }) => (
                        <>
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="name">Название *</Label>
                                <Input id="name" name="name" defaultValue={product.name} autoFocus />
                                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="unit">Единица измерения *</Label>
                                <Select name="unit" defaultValue={product.unit}>
                                    <SelectTrigger id="unit">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {UNITS.map((u) => (
                                            <SelectItem key={u} value={u}>
                                                {u}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.unit && <p className="text-xs text-destructive">{errors.unit}</p>}
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="retail_price">Стандартная цена *</Label>
                                <Input
                                    id="retail_price"
                                    name="retail_price"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    defaultValue={product.retail_price}
                                />
                                {errors.retail_price && <p className="text-xs text-destructive">{errors.retail_price}</p>}
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="description">Описание</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    rows={3}
                                    defaultValue={product.description ?? ''}
                                    placeholder="Необязательно"
                                />
                                {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
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
        { title: 'Виды товаров', href: '/products' },
        { title: 'Редактировать', href: '#' },
    ],
};
