import api from '../lib/axios';
import type { Resource, ResourceTypeEnum } from '../types/enrollment';

export interface ResourceCreate {
    title: string;
    description?: string;
    resource_type: ResourceTypeEnum;
    file_url?: string;
    external_link?: string;
    subject_id?: number;
    classroom_id?: number;
    is_downloadable?: boolean;
    order_index: number;
}

export const resourceService = {
    getSubjectResources: async (subjectId: number): Promise<Resource[]> => {
        const response = await api.get<Resource[]>(`/resources/subject/${subjectId}`);
        return response.data;
    },

    getCourseResources: async (courseId: number): Promise<Resource[]> => {
        const response = await api.get<Resource[]>(`/resources/course/${courseId}`);
        return response.data;
    },

    createResource: async (data: ResourceCreate): Promise<Resource> => {
        const response = await api.post<Resource>('/resources', data);
        return response.data;
    },

    updateResource: async (id: number, data: Partial<ResourceCreate>): Promise<Resource> => {
        const response = await api.put<Resource>(`/resources/${id}`, data);
        return response.data;
    },

    deleteResource: async (id: number): Promise<void> => {
        await api.delete(`/resources/${id}`);
    },
};
