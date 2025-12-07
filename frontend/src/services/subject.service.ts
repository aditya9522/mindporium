import api from '../lib/axios';
import type { Subject, SubjectCreate, SubjectUpdate } from '../types/enrollment';

export const subjectService = {
    getCourseSubjects: async (courseId: number): Promise<Subject[]> => {
        const response = await api.get<Subject[]>(`/subjects/course/${courseId}`);
        return response.data;
    },

    getMySubjects: async (): Promise<Subject[]> => {
        const response = await api.get<Subject[]>('/subjects/instructor/my-subjects');
        return response.data;
    },

    createSubject: async (data: SubjectCreate): Promise<Subject> => {
        const response = await api.post<Subject>('/subjects', data);
        return response.data;
    },

    updateSubject: async (id: number, data: SubjectUpdate): Promise<Subject> => {
        const response = await api.put<Subject>(`/subjects/${id}`, data);
        return response.data;
    },

    deleteSubject: async (id: number): Promise<void> => {
        await api.delete(`/subjects/${id}`);
    },
};
