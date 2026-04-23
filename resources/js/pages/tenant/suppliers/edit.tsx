import { Form } from '@inertiajs/react';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type Supplier = {
    id: number;
    name: string;
    phone: string | null;
    email: string | null;
    address: string | null;
    note: string | null;
};

type Props = {
    supplier: Supplier;
};

export default function SupplierEdit({ supplier }: Props) {
    return (
        <>
            <Head title={`Редактировать: ${supplier.name}`} />
            <div className="mx-auto max-w-lg p-6">
                <h1 className="mb-6 text-lg font-semibold">Редактировать поставщика</h1>

                <Form
                    action={`/suppliers/${supplier.id}`}
                    method="patch"
                    className="flex flex-col gap-5"
                    defaults={{
                        name: supplier.name,
                        phone: supplier.phone ?? '',
                        email: supplier.email ?? '',
                        address: supplier.address ?? '',
                        note: supplier.note ?? '',
                    }}
                >
                    {({ errors, processing }) => (
                        <>
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="name">Название *</Label>
                                <Input id="name" name="name" autoFocus defaultValue={supplier.name} />
                                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="phone">Телефон</Label>
                                <Input id="phone" name="phone" defaultValue={supplier.phone ?? ''} />
                                {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" name="email" type="email" defaultValue={supplier.email ?? ''} />
                                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="address">Адрес</Label>
                                <Textarea id="address" name="address" rows={2} defaultValue={supplier.address ?? ''} />
                                {errors.address && <p className="text-xs text-destructive">{errors.address}</p>}
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="note">Примечание</Label>
                                <Textarea id="note" name="note" rows={2} defaultValue={supplier.note ?? ''} />
                                {errors.note && <p className="text-xs text-destructive">{errors.note}</p>}
                            </div>

                            <div className="flex items-center gap-3 pt-2">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Сохраняем...' : 'Сохранить'}
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link href="/suppliers">Отмена</Link>
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

SupplierEdit.layout = {
    breadcrumbs: [
        { title: 'Дашборд', href: '/' },
        { title: 'Поставщики', href: '/suppliers' },
        { title: 'Редактировать', href: '#' },
    ],
};
