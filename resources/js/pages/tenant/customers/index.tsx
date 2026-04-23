import { Head, Link, router } from '@inertiajs/react';
import { Pencil, Plus, Trash2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Customer = {
    id: number;
    name: string;
    phone: string | null;
    email: string | null;
    address: string | null;
};

type Props = { customers: Customer[] };

export default function CustomersIndex({ customers }: Props) {
    function handleDelete(customer: Customer) {
        if (confirm(`Удалить клиента "${customer.name}"?`)) {
            router.delete(`/customers/${customer.id}`);
        }
    }

    return (
        <>
            <Head title="Клиенты" />
            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-semibold">Клиенты</h1>
                        <p className="mt-0.5 text-sm text-muted-foreground">{customers.length} клиентов</p>
                    </div>
                    <Button asChild>
                        <Link href="/customers/create">
                            <Plus className="mr-2 size-4" />
                            Добавить
                        </Link>
                    </Button>
                </div>

                {customers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-16 text-center">
                        <Users className="size-8 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Клиенты не добавлены</p>
                        <Button asChild size="sm">
                            <Link href="/customers/create">Добавить первого клиента</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="rounded-xl border">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b bg-muted/50">
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Имя</th>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Телефон</th>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
                                    <th className="px-4 py-3 text-right font-medium text-muted-foreground"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {customers.map((customer) => (
                                    <tr key={customer.id} className="border-b last:border-0 hover:bg-muted/30">
                                        <td className="px-4 py-3">
                                            <div className="font-medium">{customer.name}</div>
                                            {customer.address && <div className="text-xs text-muted-foreground">{customer.address}</div>}
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">{customer.phone ?? '—'}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{customer.email ?? '—'}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button variant="ghost" size="icon" asChild>
                                                    <Link href={`/customers/${customer.id}/edit`}>
                                                        <Pencil className="size-4" />
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive hover:text-destructive"
                                                    onClick={() => handleDelete(customer)}
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

CustomersIndex.layout = {
    breadcrumbs: [
        { title: 'Дашборд', href: '/' },
        { title: 'Клиенты', href: '/customers' },
    ],
};
