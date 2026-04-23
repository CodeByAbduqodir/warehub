import { Head, Link } from '@inertiajs/react';
import { Form } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

type User = { id: number; name: string };

type WarehouseData = {
    id: number;
    name: string;
    address: string | null;
    phone: string | null;
    manager_id: number | null;
};

type Props = {
    warehouse: WarehouseData;
    users: User[];
};

export default function WarehouseEdit({ warehouse, users }: Props) {
    return (
        <>
            <Head title={`Редактировать: ${warehouse.name}`} />
            <div className="mx-auto max-w-lg p-6">
                <h1 className="mb-6 text-lg font-semibold">Редактировать склад</h1>

                <Form action={`/warehouses/${warehouse.id}`} method="patch" className="flex flex-col gap-5">
                    {({ errors, processing }) => (
                        <>
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="name">Название *</Label>
                                <Input id="name" name="name" defaultValue={warehouse.name} autoFocus />
                                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="address">Адрес</Label>
                                <Textarea id="address" name="address" rows={2} defaultValue={warehouse.address ?? ''} />
                                {errors.address && <p className="text-xs text-destructive">{errors.address}</p>}
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="phone">Телефон</Label>
                                <Input id="phone" name="phone" defaultValue={warehouse.phone ?? ''} />
                                {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
                            </div>

                            {users.length > 0 && (
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="manager_id">Ответственный</Label>
                                    <Select name="manager_id" defaultValue={warehouse.manager_id ? String(warehouse.manager_id) : undefined}>
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
                                    {processing ? 'Сохраняем...' : 'Сохранить изменения'}
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

WarehouseEdit.layout = {
    breadcrumbs: [
        { title: 'Дашборд', href: '/' },
        { title: 'Склады', href: '/warehouses' },
        { title: 'Редактировать', href: '#' },
    ],
};
