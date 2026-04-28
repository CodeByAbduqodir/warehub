import { Link } from '@inertiajs/react';
import {
    ArrowRightLeft,
    ArchiveRestore,
    BarChart3,
    Boxes,
    ClipboardList,
    History,
    LayoutDashboard,
    PackageSearch,
    Settings,
    ShoppingCart,
    Warehouse,
    Truck,
    Users,
    Hexagon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
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
            { title: 'Виды товаров', href: '/products', icon: PackageSearch },
            { title: 'Инвентарь', href: '/stock', icon: Boxes },
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
            { title: 'История', href: '/activity', icon: History },
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
        <Sidebar collapsible="icon" variant="inset" className="border-r border-sidebar-border">
            <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
                <Link href={dashboard()} className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sky-500 shadow-sm">
                        <Hexagon className="size-4 text-white" strokeWidth={2.5} />
                    </div>
                    <div className="flex flex-col leading-none">
                        <span className="text-[15px] font-bold tracking-tight text-sidebar-primary">WareHub</span>
                        <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-sidebar-foreground/60">
                            Управление
                        </span>
                    </div>
                </Link>
            </SidebarHeader>

            <SidebarContent className="px-2 py-2">
                {navSections.map((section) => (
                    <SidebarGroup key={section.label} className="py-1">
                        <SidebarGroupLabel className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-sidebar-foreground/50">
                            {section.label}
                        </SidebarGroupLabel>
                        <SidebarMenu>
                            {section.items.map((item) => {
                                const active = isCurrentUrl(item.href);
                                return (
                                    <SidebarMenuItem
                                        key={item.title}
                                        className={cn(active && 'sidebar-active-item')}
                                    >
                                        <SidebarMenuButton
                                            asChild
                                            isActive={active}
                                            tooltip={{ children: item.title }}
                                            className={cn(
                                                'gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-150',
                                                active
                                                    ? 'text-sidebar-accent-foreground'
                                                    : 'text-sidebar-foreground hover:text-sidebar-primary',
                                            )}
                                        >
                                            <Link href={item.href}>
                                                <item.icon className="size-[15px] shrink-0" />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroup>
                ))}
            </SidebarContent>

            <SidebarFooter className="border-t border-sidebar-border px-2 py-3">
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
