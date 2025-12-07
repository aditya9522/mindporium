import api from '../lib/axios';
import type { AuthResponse, LoginCredentials, RegisterData, User } from '../types/auth';

export const authService = {
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
        const formData = new FormData();
        formData.append('username', credentials.username);
        formData.append('password', credentials.password);

        const response = await api.post<AuthResponse>('/auth/login', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    register: async (data: RegisterData): Promise<User> => {
        const response = await api.post<User>('/auth/register', data);
        return response.data;
    },

    getCurrentUser: async (): Promise<User> => {
        const response = await api.get<User>('/users/me');
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('auth-storage');
    }
};
