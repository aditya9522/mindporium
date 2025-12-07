import api from '../lib/axios';
import type { Notification } from '../types/notification';

export const notificationService = {
    getNotifications: async (skip = 0, limit = 50): Promise<Notification[]> => {
        const response = await api.get<Notification[]>('/notifications/', {
            params: { skip, limit }
        });
        return response.data;
    },

    markAsRead: async (id: number): Promise<Notification> => {
        const response = await api.put<Notification>(`/notifications/${id}/read`);
        return response.data;
    },

    markAllAsRead: async (): Promise<void> => {
        await api.put('/notifications/read-all');
    }
};
