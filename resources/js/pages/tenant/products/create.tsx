import { Head, Link, Form } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const UNITS = ['шт', 'кг', 'л', 'м', 'упаковка'];

export default function ProductCreate() {
    return (
        <>
            <Head title="Новый вид товара" />
            <div className="mx-auto max-w-lg p-6">
                <h1 className="mb-6 text-lg font-semibold">Новый вид товара</h1>

                <Form action="/products" method="post" className="flex flex-col gap-5">
                    {({ errors, processing }) => (
                        <>
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="name">Название *</Label>
                                <Input id="name" name="name" autoFocus />
                                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="unit">Единица измерения *</Label>
                                <Select name="unit" defaultValue="шт">
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
                                    defaultValue="0"
                                />
                                {errors.retail_price && <p className="text-xs text-destructive">{errors.retail_price}</p>}
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="description">Описание</Label>
                                <Textarea id="description" name="description" rows={3} placeholder="Необязательно" />
                                {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
                            </div>

                            <div className="flex items-center gap-3 pt-2">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Сохраняем...' : 'Сохранить'}
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
        { title: 'Виды товаров', href: '/products' },
        { title: 'Новый вид', href: '/products/create' },
    ],
};
