import { Head, Link } from '@inertiajs/react';
import { MapPin, Package, Pencil, Plus, Warehouse } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Manager = { id: number; name: string };

type WarehouseItem = {
    id: number;
    name: string;
    address: string | null;
    phone: string | null;
    manager: Manager | null;
    total_products: number;
    created_at: string;
};

type Props = {
    warehouses: WarehouseItem[];
};

export default function WarehousesIndex({ warehouses }: Props) {
    return (
        <>
            <Head title="Склады" />
            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-semibold">Склады</h1>
                        <p className="mt-0.5 text-sm text-muted-foreground">{warehouses.length} склад{warehouses.length === 1 ? '' : warehouses.length < 5 ? 'а' : 'ов'}</p>
                    </div>
                    <Button asChild>
                        <Link href="/warehouses/create">
                            <Plus className="mr-2 size-4" />
                            Добавить склад
                        </Link>
                    </Button>
                </div>

                {warehouses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-16 text-center">
                        <Warehouse className="size-8 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Нет складов</p>
                        <Button asChild size="sm">
                            <Link href="/warehouses/create">Создать первый склад</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {warehouses.map((warehouse) => (
                            <div key={warehouse.id} className="flex flex-col gap-3 rounded-xl border bg-card p-5 hover:shadow-sm transition-shadow">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                                            <Warehouse className="size-4 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium">{warehouse.name}</h3>
                                            {warehouse.manager && (
                                                <p className="text-xs text-muted-foreground">{warehouse.manager.name}</p>
                                            )}
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" asChild>
                                        <Link href={`/warehouses/${warehouse.id}/edit`}>
                                            <Pencil className="size-4" />
                                        </Link>
                                    </Button>
                                </div>

                                {warehouse.address && (
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <MapPin className="size-3 shrink-0" />
                                        <span className="truncate">{warehouse.address}</span>
                                    </div>
                                )}

                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground border-t pt-3">
                                    <Package className="size-3 shrink-0" />
                                    <span>{warehouse.total_products} позиций на складе</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

WarehousesIndex.layout = {
    breadcrumbs: [
        { title: 'Дашборд', href: '/' },
        { title: 'Склады', href: '/warehouses' },
    ],
};
