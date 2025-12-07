export const RoleEnum = {
    ADMIN: "admin",
    INSTRUCTOR: "instructor",
    STUDENT: "student",
} as const;

export type RoleEnum = (typeof RoleEnum)[keyof typeof RoleEnum];

export interface User {
    id: number;
    email: string;
    full_name: string;
    role: RoleEnum;
    is_active: boolean;
    is_verified: boolean;
    photo?: string;
    bio?: string;
    phone_number?: string;
    experience?: string;
    social_links?: Record<string, string>;
    banner_image?: string;
    timezone?: string;
    language?: string;
    created_at?: string;
}

export interface AuthResponse {
    access_token: string;
    refresh_token: string;
    token_type: string;
}

export interface LoginCredentials {
    username: string; // OAuth2 expects 'username', which is our email
    password: string;
}

export interface RegisterData {
    email: string;
    full_name: string;
    password: string;
    role: string;
}
