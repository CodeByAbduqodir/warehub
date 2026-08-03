import { Head, router } from '@inertiajs/react';
import { CalendarDays, PackageCheck, ReceiptText, WalletCards } from 'lucide-react';
import { Input } from '@warehub/ui';
import { dailyIncome } from '@/routes/tenant/reports';

type IncomeDocument = {
    id: number;
    number: string;
    customer: string | null;
    items_count: number;
    total_quantity: number;
    total_amount: number;
};

type Props = {
    date: string;
    documents: IncomeDocument[];
    summary: {
        total_amount: number;
        documents_count: number;
        total_quantity: number;
    };
};

export default function DailyIncome({ date, documents, summary }: Props) {
    function selectDate(selectedDate: string) {
        router.get(dailyIncome(), { date: selectedDate }, { preserveState: true });
    }

    return (
        <>
            <Head title="Доходы за день" />
            <div className="flex flex-col gap-6 p-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                    <div>
                        <h1 className="text-lg font-semibold">Доходы за день</h1>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                            Выручка только по проведённым продажам
                        </p>
                    </div>
                    <label className="relative block w-full sm:w-48">
                        <CalendarDays className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            type="date"
                            value={date}
                            onChange={(event) => selectDate(event.target.value)}
                            className="pl-9"
                            aria-label="Дата отчёта"
                        />
                    </label>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                    <SummaryCard
                        icon={WalletCards}
                        label="Выручка"
                        value={`${formatNumber(summary.total_amount)} UZS`}
                        accent="bg-sky-100 text-sky-700 dark:bg-sky-950/70 dark:text-sky-300"
                    />
                    <SummaryCard
                        icon={ReceiptText}
                        label="Проведённых продаж"
                        value={String(summary.documents_count)}
                        accent="bg-violet-100 text-violet-700 dark:bg-violet-950/70 dark:text-violet-300"
                    />
                    <SummaryCard
                        icon={PackageCheck}
                        label="Продано единиц"
                        value={formatNumber(summary.total_quantity)}
                        accent="bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300"
                    />
                </div>

                {documents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-16 text-center">
                        <WalletCards className="size-7 text-muted-foreground" />
                        <p className="text-sm font-medium">Продаж за этот день нет</p>
                        <p className="text-sm text-muted-foreground">
                            Выберите другую дату, чтобы посмотреть доходы.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-xl border">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b bg-muted/50">
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                        Документ
                                    </th>
                                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                                        Покупатель
                                    </th>
                                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                                        Позиций
                                    </th>
                                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                                        Продано
                                    </th>
                                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                                        Выручка
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {documents.map((document) => (
                                    <tr key={document.id} className="border-b last:border-0 hover:bg-muted/30">
                                        <td className="px-4 py-3 font-mono text-xs font-medium">
                                            {document.number}
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">
                                            {document.customer ?? 'Без покупателя'}
                                        </td>
                                        <td className="px-4 py-3 text-right tabular-nums">
                                            {document.items_count}
                                        </td>
                                        <td className="px-4 py-3 text-right tabular-nums">
                                            {formatNumber(document.total_quantity)}
                                        </td>
                                        <td className="px-4 py-3 text-right font-semibold tabular-nums">
                                            {formatNumber(document.total_amount)} UZS
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="border-t bg-muted/30">
                                    <td colSpan={4} className="px-4 py-3 font-medium text-muted-foreground">
                                        Итого за день
                                    </td>
                                    <td className="px-4 py-3 text-right font-semibold tabular-nums">
                                        {formatNumber(summary.total_amount)} UZS
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                )}
            </div>
        </>
    );
}

type SummaryCardProps = {
    icon: typeof WalletCards;
    label: string;
    value: string;
    accent: string;
};

function SummaryCard({ icon: Icon, label, value, accent }: SummaryCardProps) {
    return (
        <div className="rounded-xl border bg-card p-4">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <p className="mt-1 font-serif text-2xl leading-none tabular-nums">{value}</p>
                </div>
                <span className={`flex size-10 items-center justify-center rounded-lg ${accent}`}>
                    <Icon className="size-5" />
                </span>
            </div>
        </div>
    );
}

function formatNumber(value: number): string {
    return value.toLocaleString('ru-RU', { maximumFractionDigits: 3 });
}

DailyIncome.layout = {
    breadcrumbs: [
        { title: 'Дашборд', href: '/' },
        { title: 'Отчёты', href: '/reports' },
        { title: 'Доходы за день', href: '/reports/daily-income' },
    ],
};
