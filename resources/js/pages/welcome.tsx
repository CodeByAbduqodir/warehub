import { Head, Link, usePage } from '@inertiajs/react';
import { Store } from 'lucide-react';
import { dashboard } from '@/routes';

const login = () => '/login';
const register = () => '/register';

export default function Welcome({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="WareHub — Система управления складом" />
            <div
                className="flex min-h-screen flex-col"
                style={{ backgroundColor: 'var(--bg)', color: 'var(--ink)' }}
            >
                <header className="flex items-center justify-between px-6 py-4 lg:px-10">
                    <div className="flex items-center gap-2.5">
                        <div
                            className="flex size-8 items-center justify-center rounded-xl"
                            style={{ backgroundColor: 'var(--accent-color)' }}
                        >
                            <Store className="size-4 text-white" />
                        </div>
                        <span className="text-lg font-semibold tracking-tight">WareHub</span>
                    </div>

                    <nav className="flex items-center gap-3">
                        {auth.user ? (
                            <Link
                                href={dashboard()}
                                className="rounded-lg px-4 py-1.5 text-sm font-medium transition-colors hover:opacity-80"
                                style={{
                                    backgroundColor: 'var(--accent-color)',
                                    color: '#fff',
                                }}
                            >
                                Перейти в систему
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={login()}
                                    className="px-4 py-1.5 text-sm font-medium transition-opacity hover:opacity-70"
                                    style={{ color: 'var(--ink-muted)' }}
                                >
                                    Войти
                                </Link>
                                {canRegister && (
                                    <Link
                                        href={register()}
                                        className="rounded-lg px-4 py-1.5 text-sm font-medium transition-colors hover:opacity-80"
                                        style={{
                                            backgroundColor: 'var(--accent-color)',
                                            color: '#fff',
                                        }}
                                    >
                                        Зарегистрироваться
                                    </Link>
                                )}
                            </>
                        )}
                    </nav>
                </header>

                <main className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
                    <div className="max-w-2xl space-y-6">
                        <h1
                            className="font-serif text-4xl leading-tight lg:text-5xl"
                            style={{ color: 'var(--ink)' }}
                        >
                            Управление складом стало проще
                        </h1>
                        <p className="text-lg leading-relaxed" style={{ color: 'var(--ink-muted)' }}>
                            WareHub — облачная система управления складом для вашего бизнеса.
                            Контролируйте запасы, управляйте поставками и отслеживайте продажи в режиме реального времени.
                        </p>
                        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                            {canRegister && !auth.user && (
                                <Link
                                    href={register()}
                                    className="rounded-xl px-6 py-2.5 text-sm font-medium transition-colors hover:opacity-90"
                                    style={{ backgroundColor: 'var(--accent-color)', color: '#fff' }}
                                >
                                    Начать бесплатно
                                </Link>
                            )}
                            {auth.user && (
                                <Link
                                    href={dashboard()}
                                    className="rounded-xl px-6 py-2.5 text-sm font-medium transition-colors hover:opacity-90"
                                    style={{ backgroundColor: 'var(--accent-color)', color: '#fff' }}
                                >
                                    Перейти в систему
                                </Link>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}
