import { Form } from '@inertiajs/react';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function SupplierCreate() {
    return (
        <>
            <Head title="Новый поставщик" />
            <div className="mx-auto max-w-lg p-6">
                <h1 className="mb-6 text-lg font-semibold">Новый поставщик</h1>

                <Form action="/suppliers" method="post" className="flex flex-col gap-5">
                    {({ errors, processing }) => (
                        <>
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="name">Название *</Label>
                                <Input id="name" name="name" autoFocus placeholder='ООО "Альфа Трейд"' />
                                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="phone">Телефон</Label>
                                <Input id="phone" name="phone" placeholder="+998 90 123 45 67" />
                                {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" name="email" type="email" placeholder="info@supplier.uz" />
                                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="address">Адрес</Label>
                                <Textarea id="address" name="address" rows={2} placeholder="г. Ташкент, ул. Амира Темура, 1" />
                                {errors.address && <p className="text-xs text-destructive">{errors.address}</p>}
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="note">Примечание</Label>
                                <Textarea id="note" name="note" rows={2} placeholder="Дополнительная информация..." />
                                {errors.note && <p className="text-xs text-destructive">{errors.note}</p>}
                            </div>

                            <div className="flex items-center gap-3 pt-2">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Сохраняем...' : 'Создать поставщика'}
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

SupplierCreate.layout = {
    breadcrumbs: [
        { title: 'Дашборд', href: '/' },
        { title: 'Поставщики', href: '/suppliers' },
        { title: 'Новый поставщик', href: '/suppliers/create' },
    ],
};
