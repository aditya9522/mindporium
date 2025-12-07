import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, LoginCredentials, RegisterData } from '../types/auth';
import { authService } from '../services/auth.service';

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;

    login: (credentials: LoginCredentials) => Promise<User>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => void;
    checkAuth: () => Promise<void>;
    clearError: () => void;
    setLoading: (loading: boolean) => void;
    setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,

            login: async (credentials: LoginCredentials) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await authService.login(credentials);
                    localStorage.setItem('token', response.access_token);
                    localStorage.setItem('refresh_token', response.refresh_token);

                    // Fetch user details immediately after login
                    const user = await authService.getCurrentUser();

                    set({
                        token: response.access_token,
                        user,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null
                    });

                    return user; // Return user for role-based redirect
                } catch (error: any) {
                    const errorMessage = error.response?.data?.detail || 'Login failed';
                    set({
                        error: errorMessage,
                        isLoading: false,
                        isAuthenticated: false,
                        user: null,
                        token: null
                    });
                    throw error;
                }
            },

            register: async (data: RegisterData) => {
                set({ isLoading: true, error: null });
                try {
                    await authService.register(data);
                    set({ isLoading: false, error: null });
                } catch (error: any) {
                    const errorMessage = error.response?.data?.detail || 'Registration failed';
                    set({
                        error: errorMessage,
                        isLoading: false
                    });
                    throw error;
                }
            },

            logout: () => {
                authService.logout();
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                    error: null,
                    isLoading: false
                });
            },

            checkAuth: async () => {
                const token = localStorage.getItem('token');
                if (!token) {
                    set({ isAuthenticated: false, user: null, token: null, isLoading: false });
                    return;
                }

                set({ isLoading: true });
                try {
                    const user = await authService.getCurrentUser();
                    set({ user, isAuthenticated: true, token, isLoading: false, error: null });
                } catch (error) {
                    // Token invalid or expired
                    console.error('Auth check failed:', error);
                    get().logout();
                    set({ isLoading: false });
                }
            },

            clearError: () => {
                set({ error: null });
            },

            setLoading: (loading: boolean) => {
                set({ isLoading: loading });
            },

            setUser: (user: User) => {
                set({ user });
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                token: state.token,
                user: state.user,
                isAuthenticated: state.isAuthenticated
            }),
        }
    )
);
