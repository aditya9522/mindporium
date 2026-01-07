import api from '../lib/axios';

export const userService = {
    getPublicInstructors: async (): Promise<any[]> => {
        const response = await api.get('/users/instructors');
        return response.data;
    },
    updateProfile: async (data: any): Promise<any> => {
        const response = await api.put('/users/me', data);
        return response.data;
    },
};
