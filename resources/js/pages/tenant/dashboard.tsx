import { Head, Link } from '@inertiajs/react';
import { motion, useSpring, useTransform } from 'framer-motion';
import {
    AlertTriangle,
    ArchiveRestore,
    BarChart3,
    Package,
    ShoppingCart,
    TrendingUp,
} from 'lucide-react';
import { useEffect } from 'react';
import {
    Area,
    AreaChart,
    CartesianGrid,
    Legend,
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

const kpiConfig = (kpi: KPI) => [
    {
        label: 'Виды товаров',
        value: kpi.productCount,
        icon: Package,
        href: '/products',
        gradientFrom: 'from-sky-500',
        gradientTo: 'to-blue-500',
        iconBg: 'bg-sky-500/10 dark:bg-sky-400/10',
        iconColor: 'text-sky-600 dark:text-sky-400',
        textColor: 'text-sky-600 dark:text-sky-400',
    },
    {
        label: 'Выручка сегодня',
        value: kpi.todayRevenue,
        icon: ShoppingCart,
        href: '/outgoing',
        suffix: ' сум',
        gradientFrom: 'from-emerald-500',
        gradientTo: 'to-teal-500',
        iconBg: 'bg-emerald-500/10 dark:bg-emerald-400/10',
        iconColor: 'text-emerald-600 dark:text-emerald-400',
        textColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
        label: 'Приходов сегодня',
        value: kpi.todayIncomingCount,
        icon: ArchiveRestore,
        href: '/incoming',
        gradientFrom: 'from-violet-500',
        gradientTo: 'to-purple-500',
        iconBg: 'bg-violet-500/10 dark:bg-violet-400/10',
        iconColor: 'text-violet-600 dark:text-violet-400',
        textColor: 'text-violet-600 dark:text-violet-400',
    },
    {
        label: 'Мало на складе',
        value: kpi.lowStockCount,
        icon: AlertTriangle,
        href: '/reports/stock-snapshot',
        gradientFrom: kpi.lowStockCount > 0 ? 'from-rose-500' : 'from-slate-400 dark:from-slate-600',
        gradientTo: kpi.lowStockCount > 0 ? 'to-pink-500' : 'to-slate-400 dark:to-slate-600',
        iconBg: kpi.lowStockCount > 0 ? 'bg-rose-500/10' : 'bg-slate-400/10',
        iconColor: kpi.lowStockCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400',
        textColor: kpi.lowStockCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400',
    },
];

const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.06 } },
};

const cardVariant = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 110, damping: 20 } },
};

export default function TenantDashboard({ user, kpi, chartData, lowStockItems, recentOperations }: Props) {
    const firstName = user.name.split(' ')[0];

    return (
        <>
            <Head title="Дашборд" />
            <div className="flex flex-col gap-6 p-6">

                {/* Page header */}
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                    className="flex items-start justify-between"
                >
                    <div>
                        <h1 className="font-serif text-2xl font-semibold tracking-tight text-foreground">
                            Добро пожаловать, {firstName}
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Обзор складской активности за сегодня
                        </p>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground shadow-sm">
                        <TrendingUp className="size-3.5 text-emerald-500" />
                        Живые данные
                    </div>
                </motion.div>

                {/* KPI Cards */}
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
                >
                    {kpiConfig(kpi).map((card) => (
                        <motion.div key={card.label} variants={cardVariant}>
                            <Link
                                href={card.href}
                                className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                            >
                                {/* Gradient top stripe */}
                                <div className={`h-[3px] w-full bg-gradient-to-r ${card.gradientFrom} ${card.gradientTo}`} />

                                <div className="flex flex-col gap-3 p-5">
                                    <div className="flex items-start justify-between">
                                        <p className="text-[13px] font-medium text-muted-foreground">
                                            {card.label}
                                        </p>
                                        <div className={`rounded-lg p-2 ${card.iconBg}`}>
                                            <card.icon className={`size-4 ${card.iconColor}`} />
                                        </div>
                                    </div>

                                    <p className={`text-[2rem] font-bold leading-none tabular-nums tracking-tight ${card.textColor}`}>
                                        <AnimatedNumber
                                            value={card.value}
                                            suffix={'suffix' in card ? card.suffix : ''}
                                        />
                                    </p>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Chart + Low Stock */}
                <div className="grid gap-4 lg:grid-cols-3">
                    {/* Area chart */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.28, duration: 0.4 }}
                        className="col-span-2 rounded-xl border border-border bg-card p-5 shadow-sm"
                    >
                        <div className="mb-5 flex items-start justify-between">
                            <div>
                                <h2 className="text-[15px] font-semibold text-foreground">Движение товаров</h2>
                                <p className="mt-0.5 text-xs text-muted-foreground">Документов за последние 7 дней</p>
                            </div>
                            <Link
                                href="/reports/daily-chart"
                                className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:border-border/80 hover:bg-muted hover:text-foreground"
                            >
                                <BarChart3 className="size-3" />
                                Подробнее
                            </Link>
                        </div>
                        <ResponsiveContainer width="100%" height={220}>
                            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="incomingGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="outgoingGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="var(--border)"
                                    strokeOpacity={0.6}
                                    vertical={false}
                                />
                                <XAxis
                                    dataKey="label"
                                    tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                                    allowDecimals={false}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '10px',
                                        border: '1px solid var(--border)',
                                        background: 'var(--card)',
                                        color: 'var(--card-foreground)',
                                        fontSize: '12px',
                                        boxShadow: 'var(--shadow-md)',
                                    }}
                                    cursor={{ stroke: 'var(--border)', strokeWidth: 1 }}
                                />
                                <Legend
                                    wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }}
                                    iconType="circle"
                                    iconSize={8}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="incoming"
                                    name="Приход"
                                    stroke="#8B5CF6"
                                    strokeWidth={2}
                                    fill="url(#incomingGrad)"
                                    dot={{ r: 3, fill: '#8B5CF6', strokeWidth: 0 }}
                                    activeDot={{ r: 5, fill: '#8B5CF6', strokeWidth: 0 }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="outgoing"
                                    name="Продажи"
                                    stroke="#10B981"
                                    strokeWidth={2}
                                    fill="url(#outgoingGrad)"
                                    dot={{ r: 3, fill: '#10B981', strokeWidth: 0 }}
                                    activeDot={{ r: 5, fill: '#10B981', strokeWidth: 0 }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </motion.div>

                    {/* Low stock */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.34, duration: 0.4 }}
                        className="rounded-xl border border-border bg-card p-5 shadow-sm"
                    >
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-[15px] font-semibold text-foreground">Мало на складе</h2>
                            <Link
                                href="/reports/stock-snapshot"
                                className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                            >
                                Все →
                            </Link>
                        </div>

                        {lowStockItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
                                <div className="flex size-12 items-center justify-center rounded-full bg-emerald-500/10">
                                    <Package className="size-5 text-emerald-500" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-foreground">Всё в норме</p>
                                    <p className="mt-0.5 text-xs text-muted-foreground">Запасы в порядке</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2">
                                {lowStockItems.map((stock) => (
                                    <div
                                        key={stock.id}
                                        className="flex items-center justify-between rounded-lg border border-rose-200/50 bg-rose-50 px-3 py-2.5 dark:border-rose-500/15 dark:bg-rose-500/8"
                                    >
                                        <div className="min-w-0">
                                            <p className="truncate text-[13px] font-medium text-foreground">{stock.product.name}</p>
                                            <p className="text-xs text-muted-foreground">{stock.product.sku}</p>
                                        </div>
                                        <div className="ml-3 shrink-0 text-right">
                                            <p className="text-[13px] font-bold text-rose-600 dark:text-rose-400">
                                                {Number(stock.quantity).toLocaleString('ru-RU')}
                                            </p>
                                            <p className="text-[11px] text-muted-foreground">
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
                    transition={{ delay: 0.38, duration: 0.4 }}
                    className="rounded-xl border border-border bg-card shadow-sm"
                >
                    <div className="flex items-center justify-between border-b border-border px-5 py-4">
                        <h2 className="text-[15px] font-semibold text-foreground">Последние операции</h2>
                        <div className="flex gap-3">
                            <Link href="/incoming" className="text-xs text-muted-foreground transition-colors hover:text-foreground">
                                Приход →
                            </Link>
                            <Link href="/outgoing" className="text-xs text-muted-foreground transition-colors hover:text-foreground">
                                Продажи →
                            </Link>
                        </div>
                    </div>

                    {recentOperations.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-2 py-14 text-center">
                            <ArchiveRestore className="size-8 text-muted-foreground/40" />
                            <p className="text-sm text-muted-foreground">Нет подтверждённых операций</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border bg-muted/30">
                                        <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                            Тип
                                        </th>
                                        <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                            Документ
                                        </th>
                                        <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                            Контрагент
                                        </th>
                                        <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                            Оператор
                                        </th>
                                        <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                            Время
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {recentOperations.map((op, i) => (
                                        <tr key={i} className="transition-colors hover:bg-muted/20">
                                            <td className="px-5 py-3.5">
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                                                        op.type === 'incoming'
                                                            ? 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400'
                                                            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400'
                                                    }`}
                                                >
                                                    {op.type === 'incoming' ? 'Приход' : 'Продажа'}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <Link
                                                    href={`/${op.type === 'incoming' ? 'incoming' : 'outgoing'}/${op.number}`}
                                                    className="font-mono text-[12px] font-semibold text-foreground transition-colors hover:text-sky-500"
                                                >
                                                    {op.number}
                                                </Link>
                                            </td>
                                            <td className="px-5 py-3.5 text-[13px] text-muted-foreground">
                                                {op.counterparty}
                                            </td>
                                            <td className="px-5 py-3.5 text-[13px] text-muted-foreground">
                                                {op.user}
                                            </td>
                                            <td className="px-5 py-3.5 text-right font-mono text-[11px] text-muted-foreground">
                                                {op.date && (
                                                    <span>
                                                        {new Date(op.date).toLocaleDateString('ru-RU', {
                                                            day: '2-digit',
                                                            month: '2-digit',
                                                        })}
                                                    </span>
                                                )}
                                                {op.time && (
                                                    <span className="ml-1 opacity-70">{op.time}</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </motion.div>
            </div>
        </>
    );
}

TenantDashboard.layout = {
    breadcrumbs: [{ title: 'Дашборд', href: '/' }],
};
