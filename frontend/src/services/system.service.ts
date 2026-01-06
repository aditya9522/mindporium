import api from '../lib/axios';

export interface SystemSetting {
    id: number;
    key: string;
    value: any;
    description?: string;
    is_public: boolean;
    group: string;
    updated_at: string;
}

export const systemService = {
    getAllSettings: async () => {
        const response = await api.get<SystemSetting[]>('/system');
        return response.data;
    },

    getPublicSettings: async () => {
        const response = await api.get<SystemSetting[]>('/system/public');
        return response.data;
    },

    updateSetting: async (key: string, data: Partial<SystemSetting>) => {
        const response = await api.put<SystemSetting>(`/system/${key}`, data);
        return response.data;
    },

    createSetting: async (data: Partial<SystemSetting>) => {
        const response = await api.post<SystemSetting>('/system', data);
        return response.data;
    },

    deleteSetting: async (key: string) => {
        await api.delete(`/system/${key}`);
    }
};
