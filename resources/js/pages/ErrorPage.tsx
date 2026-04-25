import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { AlertTriangle, Home, RefreshCw, ServerCrash, ShieldOff, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Props = {
    status: 403 | 404 | 500 | 503;
};

const ERRORS: Record<number, { icon: React.ElementType; title: string; description: string; color: string }> = {
    403: {
        icon: ShieldOff,
        title: 'Доступ запрещён',
        description: 'У вас нет прав для просмотра этой страницы.',
        color: 'text-amber-500',
    },
    404: {
        icon: AlertTriangle,
        title: 'Страница не найдена',
        description: 'Запрошенная страница не существует или была удалена.',
        color: 'text-blue-500',
    },
    500: {
        icon: ServerCrash,
        title: 'Ошибка сервера',
        description: 'Что-то пошло не так. Мы уже работаем над этим.',
        color: 'text-rose-500',
    },
    503: {
        icon: Wrench,
        title: 'Сервис недоступен',
        description: 'Идут технические работы. Пожалуйста, зайдите позже.',
        color: 'text-violet-500',
    },
};

export default function ErrorPage({ status }: Props) {
    const error = ERRORS[status] ?? ERRORS[500];
    const Icon = error.icon;

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 100, damping: 18 }}
                className="flex max-w-md flex-col items-center gap-6 text-center"
            >
                <div className={`rounded-2xl bg-muted p-5 ${error.color}`}>
                    <Icon className="size-12" strokeWidth={1.5} />
                </div>

                <div>
                    <p className="text-6xl font-bold tabular-nums text-muted-foreground/30">{status}</p>
                    <h1 className="mt-2 text-2xl font-semibold">{error.title}</h1>
                    <p className="mt-2 text-sm text-muted-foreground">{error.description}</p>
                </div>

                <div className="flex gap-3">
                    <Button asChild>
                        <Link href="/">
                            <Home className="mr-2 size-4" />
                            На главную
                        </Link>
                    </Button>
                    {status === 500 || status === 503 ? (
                        <Button variant="outline" onClick={() => window.location.reload()}>
                            <RefreshCw className="mr-2 size-4" />
                            Обновить
                        </Button>
                    ) : null}
                </div>
            </motion.div>
        </div>
    );
}
