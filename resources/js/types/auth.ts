export type User = {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
};

export type SuperAdmin = {
    id: number;
    name: string;
    email: string;
    created_at: string;
    updated_at: string;
};

export type Auth = {
    user: User | null;
    superAdmin: SuperAdmin | null;
};

export type TwoFactorSetupData = {
    svg: string;
    url: string;
};

export type TwoFactorSecretKey = {
    secretKey: string;
};
