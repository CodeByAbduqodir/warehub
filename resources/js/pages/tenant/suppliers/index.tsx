import { Head, Link, router } from '@inertiajs/react';
import { Building2, Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Supplier = {
    id: number;
    name: string;
    phone: string | null;
    email: string | null;
    address: string | null;
    created_at: string;
};

type Props = {
    suppliers: Supplier[];
};

export default function SuppliersIndex({ suppliers }: Props) {
    function handleDelete(supplier: Supplier) {
        if (confirm(`Удалить поставщика "${supplier.name}"?`)) {
            router.delete(`/suppliers/${supplier.id}`);
        }
    }

    return (
        <>
            <Head title="Поставщики" />
            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-semibold">Поставщики</h1>
                        <p className="mt-0.5 text-sm text-muted-foreground">{suppliers.length} поставщиков</p>
                    </div>
                    <Button asChild>
                        <Link href="/suppliers/create">
                            <Plus className="mr-2 size-4" />
                            Добавить
                        </Link>
                    </Button>
                </div>

                {suppliers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-16 text-center">
                        <Building2 className="size-8 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Поставщики не добавлены</p>
                        <Button asChild size="sm">
                            <Link href="/suppliers/create">Добавить первого поставщика</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="rounded-xl border">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b bg-muted/50">
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Название</th>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Телефон</th>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
                                    <th className="px-4 py-3 text-right font-medium text-muted-foreground"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {suppliers.map((supplier) => (
                                    <tr key={supplier.id} className="border-b last:border-0 hover:bg-muted/30">
                                        <td className="px-4 py-3">
                                            <div className="font-medium">{supplier.name}</div>
                                            {supplier.address && (
                                                <div className="text-xs text-muted-foreground">{supplier.address}</div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">{supplier.phone ?? '—'}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{supplier.email ?? '—'}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button variant="ghost" size="icon" asChild>
                                                    <Link href={`/suppliers/${supplier.id}/edit`}>
                                                        <Pencil className="size-4" />
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive hover:text-destructive"
                                                    onClick={() => handleDelete(supplier)}
                                                >
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
    );
}

SuppliersIndex.layout = {
    breadcrumbs: [
        { title: 'Дашборд', href: '/' },
        { title: 'Поставщики', href: '/suppliers' },
    ],
};
