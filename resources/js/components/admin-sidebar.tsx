import { Link } from '@inertiajs/react';
import { Building2, LayoutDashboard, LogOut, Shield } from 'lucide-react';
import { usePage } from '@inertiajs/react';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import admin from '@/routes/admin';
import type { Auth } from '@/types';

const navItems = [
    { title: 'Dashboard', href: admin.dashboard.url(), icon: LayoutDashboard },
    { title: 'Tenants', href: admin.tenants.index.url(), icon: Building2 },
];

export function AdminSidebar() {
    const { auth } = usePage<{ auth: Auth }>().props;
    const { isCurrentUrl } = useCurrentUrl();

    return (
        <Sidebar collapsible="icon" variant="inset" className="border-r border-sidebar-border bg-sidebar">
            <SidebarHeader className="px-4 py-5">
                <Link href={admin.dashboard.url()} className="flex items-center gap-2">
                    <Shield className="size-5 text-foreground" />
                    <span className="text-base font-semibold tracking-tight text-foreground">Admin</span>
                </Link>
            </SidebarHeader>

            <SidebarContent className="px-2">
                <SidebarGroup className="py-1">
                    <SidebarGroupLabel className="px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                        Management
                    </SidebarGroupLabel>
                    <SidebarMenu>
                        {navItems.map((item) => (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton
                                    asChild
                                    isActive={isCurrentUrl(item.href)}
                                    tooltip={{ children: item.title }}
                                    className="gap-3 rounded-md px-2 py-2 text-sm"
                                >
                                    <Link href={item.href}>
                                        <item.icon className="size-4" />
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="px-4 py-3">
                {auth.superAdmin && (
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex min-w-0 flex-col gap-0.5">
                            <span className="truncate text-sm font-medium">{auth.superAdmin.name}</span>
                            <span className="truncate text-xs text-muted-foreground">{auth.superAdmin.email}</span>
                        </div>
                        <Link
                            href={admin.logout.url()}
                            method="post"
                            as="button"
                            className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        >
                            <LogOut className="size-4" />
                        </Link>
                    </div>
                )}
            </SidebarFooter>
        </Sidebar>
    );
}
