import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { store } from '@/routes/admin/login';

export default function AdminLogin({ status }: { status?: string }) {
    return (
        <>
            <Head title="Admin Login" />

            {status && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">{status}</div>
            )}

            <Form {...store.form()} className="flex flex-col gap-6">
                {({ processing, errors }) => (
                    <div className="grid gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email address</Label>
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                required
                                autoFocus
                                tabIndex={1}
                                autoComplete="email"
                                placeholder="admin@example.com"
                            />
                            <InputError message={errors.email} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <PasswordInput
                                id="password"
                                name="password"
                                required
                                tabIndex={2}
                                autoComplete="current-password"
                                placeholder="Password"
                            />
                            <InputError message={errors.password} />
                        </div>

                        <Button
                            type="submit"
                            className="mt-2 w-full"
                            tabIndex={3}
                            disabled={processing}
                            data-test="admin-login-button"
                        >
                            {processing && <Spinner />}
                            Sign in
                        </Button>
                    </div>
                )}
            </Form>
        </>
    );
}

AdminLogin.layout = {
    title: 'Super Admin',
    description: 'Sign in to the WareHub admin panel',
};
