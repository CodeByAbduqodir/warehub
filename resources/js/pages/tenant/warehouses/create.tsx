import { Head, Link } from '@inertiajs/react';
import { Form } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

type User = { id: number; name: string };

type Props = {
    users: User[];
};

export default function WarehouseCreate({ users }: Props) {
    return (
        <>
            <Head title="Новый склад" />
            <div className="mx-auto max-w-lg p-6">
                <h1 className="mb-6 text-lg font-semibold">Новый склад</h1>

                <Form action="/warehouses" method="post" className="flex flex-col gap-5">
                    {({ errors, processing }) => (
                        <>
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="name">Название *</Label>
                                <Input id="name" name="name" autoFocus placeholder="Главный склад" />
                                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="address">Адрес</Label>
                                <Textarea id="address" name="address" rows={2} placeholder="г. Ташкент, ул. Мирабад, 5" />
                                {errors.address && <p className="text-xs text-destructive">{errors.address}</p>}
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="phone">Телефон</Label>
                                <Input id="phone" name="phone" placeholder="+998 90 123 45 67" />
                                {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
                            </div>

                            {users.length > 0 && (
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="manager_id">Ответственный</Label>
                                    <Select name="manager_id">
                                        <SelectTrigger id="manager_id">
                                            <SelectValue placeholder="Не назначен" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {users.map((user) => (
                                                <SelectItem key={user.id} value={String(user.id)}>
                                                    {user.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.manager_id && <p className="text-xs text-destructive">{errors.manager_id}</p>}
                                </div>
                            )}

                            <div className="flex items-center gap-3 pt-2">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Создаём...' : 'Создать склад'}
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link href="/warehouses">Отмена</Link>
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

WarehouseCreate.layout = {
    breadcrumbs: [
        { title: 'Дашборд', href: '/' },
        { title: 'Склады', href: '/warehouses' },
        { title: 'Новый склад', href: '/warehouses/create' },
    ],
};
