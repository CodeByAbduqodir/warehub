import AdminSidebarLayout from '@/layouts/admin/admin-sidebar-layout';
import type { AppLayoutProps } from '@/types';

export default function AdminLayout({ breadcrumbs = [], children }: AppLayoutProps) {
    return <AdminSidebarLayout breadcrumbs={breadcrumbs}>{children}</AdminSidebarLayout>;
}
