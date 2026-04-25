import { Head, Link } from '@inertiajs/react';
import { motion, useSpring, useTransform } from 'framer-motion';
import {
    AlertTriangle,
    ArchiveRestore,
    BarChart3,
    Package,
    ShoppingCart,
} from 'lucide-react';
import { useEffect, useRef } from 'react';
import {
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

type User = { id: number; name: string };

type KPI = {
    productCount: number;
    todayRevenue: number;
    todayIncomingCount: number;
    lowStockCount: number;
};

type ChartDay = {
    date: string;
    label: string;
    incoming: number;
    outgoing: number;
};

type StockItem = {
    id: number;
    quantity: string;
    product: {
        id: number;
        name: string;
        sku: string;
        unit: string;
        min_stock: number;
    };
};

type RecentOperation = {
    type: 'incoming' | 'outgoing';
    number: string;
    time: string | null;
    date: string | null;
    counterparty: string;
    user: string;
};

type Props = {
    user: User;
    kpi: KPI;
    chartData: ChartDay[];
    lowStockItems: StockItem[];
    recentOperations: RecentOperation[];
};

function AnimatedNumber({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
    const spring = useSpring(0, { stiffness: 80, damping: 20 });
    const display = useTransform(spring, (v) => `${prefix}${Math.round(v).toLocaleString('ru-RU')}${suffix}`);

    useEffect(() => {
        spring.set(value);
    }, [spring, value]);

    return <motion.span>{display}</motion.span>;
}

const KPI_CARDS = (kpi: KPI) => [
    {
        label: 'Товаров',
        value: kpi.productCount,
        icon: Package,
        href: '/products',
        color: 'text-blue-600',
        bg: 'bg-blue-50 dark:bg-blue-950/40',
    },
    {
        label: 'Выручка сегодня',
        value: kpi.todayRevenue,
        icon: ShoppingCart,
        href: '/outgoing',
        color: 'text-emerald-600',
        bg: 'bg-emerald-50 dark:bg-emerald-950/40',
        prefix: '',
        suffix: ' сум',
    },
    {
        label: 'Приходов сегодня',
        value: kpi.todayIncomingCount,
        icon: ArchiveRestore,
        href: '/incoming',
        color: 'text-violet-600',
        bg: 'bg-violet-50 dark:bg-violet-950/40',
    },
    {
        label: 'Мало на складе',
        value: kpi.lowStockCount,
        icon: AlertTriangle,
        href: '/reports/stock-snapshot',
        color: kpi.lowStockCount > 0 ? 'text-rose-600' : 'text-muted-foreground',
        bg: kpi.lowStockCount > 0 ? 'bg-rose-50 dark:bg-rose-950/40' : 'bg-muted/50',
    },
];

const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.07 } },
};

const item = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 18 } },
};

export default function TenantDashboard({ user, kpi, chartData, lowStockItems, recentOperations }: Props) {
    const firstName = user.name.split(' ')[0];

    return (
        <>
            <Head title="Дашборд" />
            <div className="flex flex-col gap-6 p-6">

                {/* Hero */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <h1 className="font-serif text-2xl font-semibold tracking-tight">
                        Салам, {firstName} 👋
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Вот что происходит на складе сегодня
                    </p>
                </motion.div>

                {/* KPI cards */}
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
                >
                    {KPI_CARDS(kpi).map((card) => (
                        <motion.div key={card.label} variants={item}>
                            <Link
                                href={card.href}
                                className="group flex flex-col gap-3 rounded-xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">{card.label}</span>
                                    <div className={`rounded-lg p-2 ${card.bg}`}>
                                        <card.icon className={`size-4 ${card.color}`} />
                                    </div>
                                </div>
                                <div className="text-2xl font-bold tabular-nums">
                                    <AnimatedNumber
                                        value={card.value}
                                        prefix={card.prefix}
                                        suffix={card.suffix}
                                    />
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Chart + Low Stock */}
                <div className="grid gap-4 lg:grid-cols-3">
                    {/* 7-day chart */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.4 }}
                        className="col-span-2 rounded-xl border bg-card p-5 shadow-sm"
                    >
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <h2 className="text-sm font-semibold">Движение товаров</h2>
                                <p className="text-xs text-muted-foreground">Документов за последние 7 дней</p>
                            </div>
                            <Link href="/reports/daily-chart" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                                <BarChart3 className="size-3.5" />
                                Подробнее
                            </Link>
                        </div>
                        <ResponsiveContainer width="100%" height={220}>
                            <LineChart data={chartData} margin={{ top: 4, right: 4, left: -16, bottom: 4 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                <XAxis
                                    dataKey="label"
                                    tick={{ fontSize: 11 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    tick={{ fontSize: 11 }}
                                    allowDecimals={false}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '8px',
                                        border: '1px solid var(--border)',
                                        background: 'var(--card)',
                                        color: 'var(--card-foreground)',
                                        fontSize: '12px',
                                    }}
                                />
                                <Legend wrapperStyle={{ fontSize: '11px' }} />
                                <Line
                                    type="monotone"
                                    dataKey="incoming"
                                    name="Приход"
                                    stroke="#6366f1"
                                    strokeWidth={2}
                                    dot={{ r: 3 }}
                                    activeDot={{ r: 5 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="outgoing"
                                    name="Продажи"
                                    stroke="#10b981"
                                    strokeWidth={2}
                                    dot={{ r: 3 }}
                                    activeDot={{ r: 5 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </motion.div>

                    {/* Low stock */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35, duration: 0.4 }}
                        className="rounded-xl border bg-card p-5 shadow-sm"
                    >
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-sm font-semibold">Мало на складе</h2>
                            <Link href="/reports/stock-snapshot" className="text-xs text-muted-foreground hover:text-foreground">
                                Все →
                            </Link>
                        </div>

                        {lowStockItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
                                <div className="rounded-full bg-emerald-100 p-2.5 dark:bg-emerald-950/50">
                                    <Package className="size-4 text-emerald-600" />
                                </div>
                                <p className="text-xs text-muted-foreground">Всё в норме</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2">
                                {lowStockItems.map((stock) => (
                                    <div
                                        key={stock.id}
                                        className="flex items-center justify-between rounded-lg bg-rose-50 px-3 py-2 dark:bg-rose-950/30"
                                    >
                                        <div className="min-w-0">
                                            <p className="truncate text-xs font-medium">{stock.product.name}</p>
                                            <p className="text-xs text-muted-foreground">{stock.product.sku}</p>
                                        </div>
                                        <div className="ml-2 shrink-0 text-right">
                                            <p className="text-xs font-semibold text-rose-600">
                                                {Number(stock.quantity).toLocaleString('ru-RU')}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                мин: {stock.product.min_stock}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* Recent operations */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.4 }}
                    className="rounded-xl border bg-card shadow-sm"
                >
                    <div className="flex items-center justify-between border-b px-5 py-4">
                        <h2 className="text-sm font-semibold">Последние операции</h2>
                        <div className="flex gap-3">
                            <Link href="/incoming" className="text-xs text-muted-foreground hover:text-foreground">Приход →</Link>
                            <Link href="/outgoing" className="text-xs text-muted-foreground hover:text-foreground">Продажи →</Link>
                        </div>
                    </div>

                    {recentOperations.length === 0 ? (
                        <div className="py-12 text-center text-sm text-muted-foreground">
                            Нет подтверждённых операций
                        </div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b bg-muted/30">
                                    <th className="px-5 py-2.5 text-left text-xs font-medium text-muted-foreground">Тип</th>
                                    <th className="px-5 py-2.5 text-left text-xs font-medium text-muted-foreground">Документ</th>
                                    <th className="px-5 py-2.5 text-left text-xs font-medium text-muted-foreground">Контрагент</th>
                                    <th className="px-5 py-2.5 text-left text-xs font-medium text-muted-foreground">Оператор</th>
                                    <th className="px-5 py-2.5 text-right text-xs font-medium text-muted-foreground">Время</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentOperations.map((op, i) => (
                                    <tr key={i} className="border-b last:border-0 hover:bg-muted/20">
                                        <td className="px-5 py-3">
                                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                                op.type === 'incoming'
                                                    ? 'bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-400'
                                                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                                            }`}>
                                                {op.type === 'incoming' ? 'Приход' : 'Продажа'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3">
                                            <Link
                                                href={`/${op.type === 'incoming' ? 'incoming' : 'outgoing'}/${op.number}`}
                                                className="font-mono text-xs font-medium hover:underline"
                                            >
                                                {op.number}
                                            </Link>
                                        </td>
                                        <td className="px-5 py-3 text-muted-foreground">{op.counterparty}</td>
                                        <td className="px-5 py-3 text-muted-foreground">{op.user}</td>
                                        <td className="px-5 py-3 text-right text-xs text-muted-foreground">
                                            {op.date && (
                                                <span>{new Date(op.date).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })}</span>
                                            )}
                                            {op.time && (
                                                <span className="ml-1">{op.time}</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </motion.div>
            </div>
        </>
    );
}

TenantDashboard.layout = {
    breadcrumbs: [{ title: 'Дашборд', href: '/' }],
};
