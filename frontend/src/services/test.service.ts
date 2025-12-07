import api from '../lib/axios';
import type { Test, TestCreate, Submission, SubmissionCreate } from '../types/test';

export const testService = {
    createTest: async (data: TestCreate): Promise<Test> => {
        const response = await api.post<Test>('/tests/', data);
        return response.data;
    },

    updateTest: async (id: number, data: Partial<TestCreate>): Promise<Test> => {
        const response = await api.put<Test>(`/tests/${id}`, data);
        return response.data;
    },

    deleteTest: async (id: number): Promise<void> => {
        await api.delete(`/tests/${id}`);
    },

    getTest: async (id: number): Promise<Test> => {
        const response = await api.get<Test>(`/tests/${id}`);
        return response.data;
    },

    getCourseTests: async (courseId: number): Promise<Test[]> => {
        const response = await api.get<Test[]>(`/tests/course/${courseId}`);
        return response.data;
    },

    getAvailableTests: async (): Promise<Test[]> => {
        const response = await api.get<Test[]>('/tests/available/list');
        return response.data;
    },

    getInstructorTests: async (): Promise<Test[]> => {
        const response = await api.get<Test[]>('/tests/instructor/my-tests');
        return response.data;
    },

    submitTest: async (data: SubmissionCreate): Promise<Submission> => {
        const response = await api.post<Submission>('/submissions/', data);
        return response.data;
    },

    getMySubmissions: async (): Promise<Submission[]> => {
        const response = await api.get<Submission[]>('/submissions/me');
        return response.data;
    },

    getTestSubmissions: async (testId: number): Promise<Submission[]> => {
        const response = await api.get<Submission[]>(`/submissions/test/${testId}`);
        return response.data;
    }
};
