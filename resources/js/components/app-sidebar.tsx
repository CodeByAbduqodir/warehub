import { Link } from '@inertiajs/react';
import {
    ArrowRightLeft,
    ArchiveRestore,
    BarChart3,
    ClipboardList,
    LayoutDashboard,
    PackageSearch,
    Settings,
    ShoppingCart,
    Store,
    Truck,
    Users,
    Warehouse,
} from 'lucide-react';
import { NavUser } from '@/components/nav-user';
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
import { dashboard } from '@/routes';

interface NavSection {
    label: string;
    items: Array<{
        title: string;
        href: string;
        icon: React.ElementType;
    }>;
}

const navSections: NavSection[] = [
    {
        label: 'Операции',
        items: [
            { title: 'Дашборд', href: dashboard(), icon: LayoutDashboard },
            { title: 'Товары', href: '/products', icon: PackageSearch },
            { title: 'Склады', href: '/warehouses', icon: Warehouse },
            { title: 'Приход', href: '/incoming', icon: ArchiveRestore },
            { title: 'Продажи', href: '/outgoing', icon: ShoppingCart },
            { title: 'Перемещения', href: '/transfers', icon: ArrowRightLeft },
            { title: 'Инвентаризация', href: '/inventory', icon: ClipboardList },
        ],
    },
    {
        label: 'Контрагенты',
        items: [
            { title: 'Поставщики', href: '/suppliers', icon: Truck },
            { title: 'Клиенты', href: '/customers', icon: Users },
            { title: 'Отчёты', href: '/reports', icon: BarChart3 },
        ],
    },
    {
        label: 'Система',
        items: [{ title: 'Настройки', href: '/settings/profile', icon: Settings }],
    },
];

export function AppSidebar() {
    const { isCurrentUrl } = useCurrentUrl();

    return (
        <Sidebar collapsible="icon" variant="inset" className="border-r border-sidebar-border bg-sidebar">
            <SidebarHeader className="px-4 py-5">
                <Link href={dashboard()} className="flex items-center gap-2">
                    <Store className="size-5 text-foreground" />
                    <span className="text-base font-semibold tracking-tight text-foreground">WareHub</span>
                </Link>
            </SidebarHeader>

            <SidebarContent className="px-2">
                {navSections.map((section) => (
                    <SidebarGroup key={section.label} className="py-1">
                        <SidebarGroupLabel className="px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                            {section.label}
                        </SidebarGroupLabel>
                        <SidebarMenu>
                            {section.items.map((item) => (
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
                ))}
            </SidebarContent>

            <SidebarFooter className="px-2 py-3">
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
