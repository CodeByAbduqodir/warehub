import { Head } from '@inertiajs/react';
import { Building2, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import admin from '@/routes/admin';

type Props = {
    tenantCount?: number;
};

export default function AdminDashboard({ tenantCount = 0 }: Props) {
    return (
        <>
            <Head title="Admin Dashboard" />
            <div className="flex flex-col gap-6 p-6">
                <div>
                    <h1 className="text-lg font-semibold">Dashboard</h1>
                    <p className="mt-1 text-sm text-muted-foreground">WareHub platform overview.</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Tenants</CardTitle>
                            <Building2 className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{tenantCount}</div>
                            <p className="text-xs text-muted-foreground">Active workspaces</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Users</CardTitle>
                            <Users className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">—</div>
                            <p className="text-xs text-muted-foreground">Across all tenants</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

AdminDashboard.layout = {
    breadcrumbs: [{ title: 'Dashboard', href: admin.dashboard.url() }],
};
