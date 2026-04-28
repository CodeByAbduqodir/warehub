import { Link } from '@inertiajs/react';
import { Store } from 'lucide-react';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({ children, title, description }: AuthLayoutProps) {
    return (
        <div
            className="flex min-h-svh flex-col items-center justify-center p-6 md:p-10"
            style={{ backgroundColor: 'var(--bg)' }}
        >
            <div className="w-full max-w-sm">
                <div className="flex flex-col gap-8">
                    {/* Logo */}
                    <div className="flex flex-col items-center gap-5">
                        <Link
                            href="/"
                            className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
                        >
                            <div
                                className="flex size-9 items-center justify-center rounded-xl"
                                style={{ backgroundColor: 'var(--accent-color)' }}
                            >
                                <Store className="size-5 text-white" />
                            </div>
                            <span
                                className="text-xl font-semibold tracking-tight"
                                style={{ color: 'var(--ink)' }}
                            >
                                WareHub
                            </span>
                        </Link>

                        {(title || description) && (
                            <div className="space-y-1 text-center">
                                {title && (
                                    <h1
                                        className="font-serif text-2xl"
                                        style={{ color: 'var(--ink)' }}
                                    >
                                        {title}
                                    </h1>
                                )}
                                {description && (
                                    <p
                                        className="text-sm"
                                        style={{ color: 'var(--ink-muted)' }}
                                    >
                                        {description}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Card */}
                    <div
                        className="rounded-2xl p-7 shadow-sm"
                        style={{
                            backgroundColor: 'var(--bg-elevated)',
                            border: '1px solid var(--line)',
                        }}
                    >
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
