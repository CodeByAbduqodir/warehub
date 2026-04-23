import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Warehouse = { id: number; name: string };
type Props = { warehouses: Warehouse[] };

export default function InventoryCreate({ warehouses }: Props) {
    const [form, setForm] = useState({
        date: new Date().toISOString().split('T')[0],
        warehouse_id: '',
        type: 'planned',
        note: '',
    });
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setProcessing(true);
        router.post('/inventory', form, {
            onError: (err) => { setErrors(err); setProcessing(false); },
        });
    }

    return (
        <>
            <Head title="Новая инвентаризация" />
            <div className="mx-auto max-w-lg p-6">
                <div className="mb-6">
                    <h1 className="text-lg font-semibold">Новая инвентаризация</h1>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                        Система сделает снимок остатков на выбранном складе
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="date">Дата</Label>
                        <Input
                            id="date"
                            type="date"
                            value={form.date}
                            onChange={(e) => setForm({ ...form, date: e.target.value })}
                        />
                        {errors.date && <p className="text-xs text-destructive">{errors.date}</p>}
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label>Склад</Label>
                        <Select
                            value={form.warehouse_id}
                            onValueChange={(v) => setForm({ ...form, warehouse_id: v })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Выберите склад" />
                            </SelectTrigger>
                            <SelectContent>
                                {warehouses.map((w) => (
                                    <SelectItem key={w.id} value={String(w.id)}>{w.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.warehouse_id && <p className="text-xs text-destructive">{errors.warehouse_id}</p>}
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label>Тип инвентаризации</Label>
                        <Select
                            value={form.type}
                            onValueChange={(v) => setForm({ ...form, type: v })}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="planned">Плановая</SelectItem>
                                <SelectItem value="unplanned">Внеплановая</SelectItem>
                                <SelectItem value="partial">Частичная</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="note">Комментарий</Label>
                        <Input
                            id="note"
                            value={form.note}
                            onChange={(e) => setForm({ ...form, note: e.target.value })}
                            placeholder="Необязательно"
                        />
                    </div>

                    <div className="flex gap-2 pt-2">
                        <Button type="submit" disabled={processing || !form.warehouse_id}>
                            Начать инвентаризацию
                        </Button>
                        <Button type="button" variant="outline" onClick={() => router.get('/inventory')}>
                            Отмена
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}

InventoryCreate.layout = {
    breadcrumbs: [
        { title: 'Дашборд', href: '/' },
        { title: 'Инвентаризация', href: '/inventory' },
        { title: 'Новая', href: '/inventory/create' },
    ],
};
