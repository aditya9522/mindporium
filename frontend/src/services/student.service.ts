import api from '../lib/axios';

export const studentService = {
    getDashboard: async () => {
        const response = await api.get('/dashboard/student/overview');
        return response.data;
    },

    getCourseProgress: async (courseId: number) => {
        const response = await api.get(`/dashboard/student/course/${courseId}/progress`);
        return response.data;
    }
};
