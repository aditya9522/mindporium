import api from '../lib/axios';

export const userService = {
    getPublicInstructors: async (): Promise<any[]> => {
        const response = await api.get('/users/instructors');
        return response.data;
    },
};
