import api from '../lib/axios';

export const announcementService = {
    getAllAnnouncements: async (): Promise<any[]> => {
        const response = await api.get('/announcements/all');
        return response.data;
    },

    getMyAnnouncements: async (): Promise<any[]> => {
        const response = await api.get('/announcements/my-announcements');
        return response.data;
    },

    getCourseAnnouncements: async (courseId: number): Promise<any[]> => {
        const response = await api.get(`/announcements/course/${courseId}`);
        return response.data;
    },

    createAnnouncement: async (data: any): Promise<any> => {
        const response = await api.post('/announcements/', data);
        return response.data;
    },

    updateAnnouncement: async (id: number, data: any): Promise<any> => {
        const response = await api.put(`/announcements/${id}`, data);
        return response.data;
    },

    deleteAnnouncement: async (id: number): Promise<void> => {
        await api.delete(`/announcements/${id}`);
    },
};

export interface Announcement {
    id: number;
    title: string;
    content: string;
    is_pinned: boolean;
    created_at: string;
}
