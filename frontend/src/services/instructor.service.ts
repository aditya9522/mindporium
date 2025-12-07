import api from '../lib/axios';
import type { InstructorDashboard, CourseOverview } from '../types/instructor';

export const instructorService = {
    getDashboard: async (): Promise<InstructorDashboard> => {
        const response = await api.get<InstructorDashboard>('/dashboard/instructor/overview');
        return response.data;
    },

    getPerformance: async () => {
        const response = await api.get('/dashboard/instructor/performance');
        return response.data;
    },

    getCourseOverview: async (courseId: number) => {
        const response = await api.get<CourseOverview>(`/dashboard/instructor/course/${courseId}/overview`);
        return response.data;
    }
};
