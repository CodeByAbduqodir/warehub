import { Head, Link, router } from '@inertiajs/react';
import { History } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Activity = {
    type: 'incoming' | 'outgoing' | 'transfer' | 'inventory';
    label: string;
    number: string;
    timestamp: string;
    time: string;
    date: string;
    counterparty: string | null;
    warehouse: string | null;
    user: string | null;
    link: string;
};

type PaginatedActivities = {
    data: Activity[];
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
};

type Props = {
    activities: PaginatedActivities;
    activeType: string;
};

const TYPE_FILTERS = [
    { key: 'all', label: 'Все' },
    { key: 'incoming', label: 'Приход' },
    { key: 'outgoing', label: 'Продажа' },
    { key: 'transfer', label: 'Перемещения' },
    { key: 'inventory', label: 'Инвентаризация' },
];

const TYPE_STYLES: Record<string, { badge: string; dot: string }> = {
    incoming: {
        badge: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
        dot: 'bg-emerald-500',
    },
    outgoing: {
        badge: 'bg-orange-50 text-orange-700 ring-1 ring-orange-200',
        dot: 'bg-orange-500',
    },
    transfer: {
        badge: 'bg-violet-50 text-violet-700 ring-1 ring-violet-200',
        dot: 'bg-violet-500',
    },
    inventory: {
        badge: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
        dot: 'bg-slate-400',
    },
};

function formatDateLabel(dateStr: string): string {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const isSameDay = (a: Date, b: Date) =>
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate();

    if (isSameDay(date, today)) return 'Сегодня';
    if (isSameDay(date, yesterday)) return 'Вчера';

    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
}

function groupByDate(activities: Activity[]): [string, Activity[]][] {
    const map = new Map<string, Activity[]>();
    for (const item of activities) {
        const key = item.date ?? 'unknown';
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(item);
    }
    return Array.from(map.entries());
}

export default function ActivityIndex({ activities, activeType }: Props) {
    function setFilter(type: string) {
        router.get('/activity', { type }, { preserveState: false });
    }

    function goToPage(page: number) {
        router.get('/activity', { type: activeType, page }, { preserveState: true });
    }

    const groups = groupByDate(activities.data);

    return (
        <>
            <Head title="История операций" />
            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-semibold">История операций</h1>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                            {activities.total} операций всего
                        </p>
                    </div>
                </div>

                {/* Type filter tabs */}
                <div className="flex flex-wrap gap-2">
                    {TYPE_FILTERS.map((f) => (
                        <button
                            key={f.key}
                            onClick={() => setFilter(f.key)}
                            className={[
                                'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                                activeType === f.key
                                    ? 'bg-foreground text-background'
                                    : 'border border-border bg-background text-muted-foreground hover:text-foreground',
                            ].join(' ')}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                {/* Empty state */}
                {activities.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-16 text-center">
                        <History className="size-8 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Операций пока нет</p>
                    </div>
                ) : (
                    <>
                        {/* Timeline grouped by date */}
                        <div className="flex flex-col gap-6">
                            {groups.map(([date, items]) => (
                                <div key={date}>
                                    <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                                        {formatDateLabel(date)}
                                    </p>

                                    <div className="rounded-xl border divide-y">
                                        {items.map((item, idx) => {
                                            const style = TYPE_STYLES[item.type] ?? TYPE_STYLES.inventory;
                                            return (
                                                <div
                                                    key={idx}
                                                    className="flex items-center gap-4 px-4 py-3 hover:bg-muted/30 transition-colors"
                                                >
                                                    {/* Dot */}
                                                    <div className={`size-2 shrink-0 rounded-full ${style.dot}`} />

                                                    {/* Time */}
                                                    <span className="w-10 shrink-0 tabular-nums text-xs text-muted-foreground">
                                                        {item.time}
                                                    </span>

                                                    {/* Type badge */}
                                                    <span className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-medium ${style.badge}`}>
                                                        {item.label}
                                                    </span>

                                                    {/* Number */}
                                                    <Link
                                                        href={item.link}
                                                        className="shrink-0 font-mono text-xs font-medium text-foreground hover:text-[var(--accent)] transition-colors"
                                                    >
                                                        {item.number}
                                                    </Link>

                                                    {/* Counterparty */}
                                                    {item.counterparty && (
                                                        <span className="min-w-0 flex-1 truncate text-sm text-foreground">
                                                            {item.counterparty}
                                                        </span>
                                                    )}

                                                    {/* Warehouse */}
                                                    {item.warehouse && !item.counterparty && (
                                                        <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
                                                            {item.warehouse}
                                                        </span>
                                                    )}

                                                    {!item.counterparty && !item.warehouse && (
                                                        <span className="flex-1" />
                                                    )}

                                                    {/* User */}
                                                    {item.user && (
                                                        <span className="shrink-0 text-xs text-muted-foreground">
                                                            {item.user}
                                                        </span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {activities.last_page > 1 && (
                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                                <span>
                                    Страница {activities.current_page} из {activities.last_page}
                                </span>
                                <div className="flex gap-2">
                                    {activities.current_page > 1 && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => goToPage(activities.current_page - 1)}
                                        >
                                            Назад
                                        </Button>
                                    )}
                                    {activities.current_page < activities.last_page && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => goToPage(activities.current_page + 1)}
                                        >
                                            Вперёд
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </>
    );
}

ActivityIndex.layout = {
    breadcrumbs: [
        { title: 'Дашборд', href: '/' },
        { title: 'История операций', href: '/activity' },
    ],
};
