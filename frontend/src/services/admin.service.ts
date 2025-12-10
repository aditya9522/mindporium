import api from '../lib/axios';
import type { SystemStats, SystemSetting, SystemSettingUpdate } from '../types/admin';

export const adminService = {
    getSystemStats: async (): Promise<SystemStats> => {
        const response = await api.get<SystemStats>('/admin/stats');
        return response.data;
    },

    getDashboardOverview: async (): Promise<any> => {
        const response = await api.get('/dashboard/admin/overview');
        return response.data;
    },

    getSettings: async (): Promise<SystemSetting[]> => {
        const response = await api.get<SystemSetting[]>('/admin/settings');
        return response.data;
    },

    updateSetting: async (key: string, data: SystemSettingUpdate): Promise<SystemSetting> => {
        const response = await api.put<SystemSetting>(`/admin/settings/${key}`, data);
        return response.data;
    },

    createSetting: async (data: any): Promise<SystemSetting> => {
        const response = await api.post<SystemSetting>('/admin/settings', data);
        return response.data;
    },

    getUsers: async (): Promise<any[]> => {
        const response = await api.get('/users/');
        return response.data;
    },

    getAllCourses: async (): Promise<any[]> => {
        const response = await api.get('/courses/admin/all');
        return response.data;
    },

    updateUser: async (userId: number, data: any): Promise<any> => {
        const response = await api.put(`/users/${userId}`, data);
        return response.data;
    },

    getInstructors: async (): Promise<any[]> => {
        const response = await api.get('/admin/instructors');
        return response.data;
    },

    createInstructor: async (data: any): Promise<any> => {
        const response = await api.post('/admin/instructors', data);
        return response.data;
    },

    createAdmin: async (data: any): Promise<any> => {
        const response = await api.post('/admin/admins', data);
        return response.data;
    },

    getInstructorPerformance: async (instructorId: number): Promise<any> => {
        const response = await api.get(`/dashboard/admin/instructor/${instructorId}/performance`);
        return response.data;
    },

    getInstructorDashboard: async (instructorId: number): Promise<any> => {
        const response = await api.get(`/dashboard/admin/instructor/${instructorId}/monitoring`);
        return response.data;
    },

    getCourseAnalytics: async (courseId: number): Promise<any> => {
        const response = await api.get(`/dashboard/admin/course/${courseId}/analytics`);
        return response.data;
    },

    getCourseTracking: async (courseId: number): Promise<any> => {
        const response = await api.get(`/dashboard/admin/course/${courseId}/tracking`);
        return response.data;
    },

    deleteUser: async (userId: number): Promise<any> => {
        const response = await api.delete(`/users/${userId}`);
        return response.data;
    },

    getAppFeedbacks: async (): Promise<any[]> => {
        const response = await api.get('/feedback/app');
        return response.data;
    },

    getAppFeedbackAnalysis: async (): Promise<any> => {
        const response = await api.get('/feedback/app/analysis');
        return response.data;
    },
};
