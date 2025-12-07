import api from '../lib/axios';
import type { Enrollment, EnrollmentCreate } from '../types/enrollment';

export const enrollmentService = {
    enroll: async (data: EnrollmentCreate): Promise<Enrollment> => {
        const response = await api.post<Enrollment>('/enrollments', data);
        return response.data;
    },

    getMyEnrollments: async (): Promise<Enrollment[]> => {
        const response = await api.get<Enrollment[]>('/enrollments/me');
        return response.data;
    },

    getCourseProgress: async (courseId: number): Promise<any> => {
        const response = await api.get(`/enrollments/progress/${courseId}`);
        return response.data;
    },

    checkEnrollment: async (courseId: number): Promise<boolean> => {
        try {
            const enrollments = await enrollmentService.getMyEnrollments();
            return enrollments.some(e => e.course_id === courseId);
        } catch (error) {
            return false;
        }
    },

    completeResource: async (resourceId: number): Promise<any> => {
        const response = await api.post(`/enrollments/resource/${resourceId}/complete`);
        return response.data;
    },
};
