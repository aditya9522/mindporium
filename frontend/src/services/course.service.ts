import api from '../lib/axios';
import type { Course, CourseCreate, CourseUpdate, CourseFilters } from '../types/course';

export const courseService = {
    getCourses: async (filters?: CourseFilters): Promise<Course[]> => {
        const params = new URLSearchParams();
        if (filters?.search) params.append('search', filters.search);
        if (filters?.skip) params.append('skip', filters.skip.toString());
        if (filters?.limit) params.append('limit', filters.limit.toString());

        const response = await api.get<Course[]>(`/courses?${params.toString()}`);
        return response.data;
    },

    getMyCourses: async (filters?: CourseFilters): Promise<Course[]> => {
        const params = new URLSearchParams();
        if (filters?.search) params.append('search', filters.search);
        if (filters?.skip) params.append('skip', filters.skip.toString());
        if (filters?.limit) params.append('limit', filters.limit.toString());

        const response = await api.get<Course[]>('/courses/instructor/my-courses', { params });
        return response.data;
    },

    getCourse: async (id: number): Promise<Course> => {
        const response = await api.get<Course>(`/courses/${id}`);
        return response.data;
    },

    createCourse: async (data: CourseCreate): Promise<Course> => {
        const response = await api.post<Course>('/courses', data);
        return response.data;
    },

    updateCourse: async (id: number, data: CourseUpdate): Promise<Course> => {
        const response = await api.put<Course>(`/courses/${id}`, data);
        return response.data;
    },

    deleteCourse: async (id: number): Promise<void> => {
        await api.delete(`/courses/${id}`);
    },
};
