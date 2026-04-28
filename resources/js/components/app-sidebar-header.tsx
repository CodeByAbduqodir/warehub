import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useAppearance } from '@/hooks/use-appearance';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { cn } from '@/lib/utils';
import { Moon, Sun } from 'lucide-react';

function ThemeToggle() {
    const { resolvedAppearance, updateAppearance } = useAppearance();
    const isDark = resolvedAppearance === 'dark';

    return (
        <button
            type="button"
            role="switch"
            aria-checked={isDark}
            aria-label="Переключить тему"
            onClick={() => updateAppearance(isDark ? 'light' : 'dark')}
            className={cn(
                'relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full border transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                isDark
                    ? 'border-amber-500/25 bg-amber-950/50'
                    : 'border-sky-300/60 bg-sky-100',
            )}
        >
            {/* Static background icons */}
            <span className="pointer-events-none absolute inset-0 flex items-center justify-between px-1.5">
                <Sun
                    className={cn(
                        'size-3 transition-opacity duration-300',
                        isDark ? 'text-amber-600 opacity-40' : 'text-sky-400 opacity-0',
                    )}
                />
                <Moon
                    className={cn(
                        'size-3 transition-opacity duration-300',
                        isDark ? 'text-amber-400 opacity-50' : 'text-sky-400 opacity-0',
                    )}
                />
            </span>

            {/* Sliding thumb */}
            <span
                className={cn(
                    'relative z-10 flex size-[18px] items-center justify-center rounded-full shadow-md transition-all duration-300',
                    isDark
                        ? 'translate-x-[24px] bg-amber-400'
                        : 'translate-x-[3px] bg-sky-500',
                )}
            >
                {isDark ? (
                    <Moon className="size-2.5 text-amber-950" strokeWidth={2.5} />
                ) : (
                    <Sun className="size-2.5 text-white" strokeWidth={2.5} />
                )}
            </span>
        </button>
    );
}

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    return (
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-sidebar-border/50 bg-background/80 px-4 backdrop-blur-sm transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1 size-8 text-muted-foreground hover:text-foreground" />
                {breadcrumbs.length > 0 && (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                        <span className="text-border/80">/</span>
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                )}
            </div>
            <ThemeToggle />
        </header>
    );
}
