import { Head } from '@inertiajs/react';
import { Building2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import admin from '@/routes/admin';

type Tenant = {
    id: number;
    subdomain: string;
    name: string;
    owner_email: string;
    status: string;
    created_at: string;
};

type Props = {
    tenants: Tenant[];
};

export default function AdminTenants({ tenants }: Props) {
    return (
        <>
            <Head title="Tenants" />
            <div className="flex flex-col gap-6 p-6">
                <div>
                    <h1 className="text-lg font-semibold">Tenants</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {tenants.length} workspace{tenants.length !== 1 ? 's' : ''} registered
                    </p>
                </div>

                {tenants.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-16 text-center">
                        <Building2 className="size-8 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">No tenants yet</p>
                    </div>
                ) : (
                    <div className="rounded-xl border">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b bg-muted/50">
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Workspace</th>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Owner</th>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Created</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tenants.map((tenant) => (
                                    <tr key={tenant.id} className="border-b last:border-0 hover:bg-muted/30">
                                        <td className="px-4 py-3">
                                            <div className="font-medium">{tenant.name}</div>
                                            <div className="text-xs text-muted-foreground">{tenant.subdomain}.warehub.test</div>
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">{tenant.owner_email}</td>
                                        <td className="px-4 py-3">
                                            <Badge variant={tenant.status === 'active' ? 'default' : 'secondary'}>
                                                {tenant.status}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">
                                            {new Date(tenant.created_at).toLocaleDateString()}
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

AdminTenants.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: admin.dashboard.url() },
        { title: 'Tenants', href: admin.tenants.index.url() },
    ],
};
