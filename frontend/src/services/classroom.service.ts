import api from '../lib/axios';

export interface Classroom {
    id: number;
    title: string;
    description?: string;
    start_time: string;
    end_time?: string;
    status: 'not_started' | 'scheduled' | 'live' | 'completed' | 'cancelled';
    instructor_id: number;
    subject_id?: number;
    meeting_id?: string;
    provider: 'zoom' | 'meet' | 'custom';
    instructor?: {
        full_name: string;
        photo?: string;
    };
    subject?: {
        title: string;
        course?: {
            title: string;
        };
    };
}

export interface JoinResponse {
    classroom_id: number;
    meeting_id: string;
    websocket_url: string;
    turn_server: {
        urls: string[];
        username?: string;
        credential?: string;
    };
    user: {
        id: number;
        name: string;
        role: string;
        photo?: string;
    };
}

export const classroomService = {
    getAllClassrooms: async () => {
        const response = await api.get<Classroom[]>('/classrooms');
        return response.data;
    },

    getClassroom: async (id: number) => {
        const response = await api.get<Classroom>(`/classrooms/${id}`);
        return response.data;
    },

    createClassroom: async (data: Partial<Classroom>) => {
        const response = await api.post<Classroom>('/classrooms', data);
        return response.data;
    },

    updateClassroom: async (id: number, data: Partial<Classroom>) => {
        const response = await api.put<Classroom>(`/classrooms/${id}`, data);
        return response.data;
    },

    deleteClassroom: async (id: number) => {
        await api.delete(`/classrooms/${id}`);
    },

    joinClassroom: async (id: number) => {
        const response = await api.post<JoinResponse>(`/classrooms/${id}/join`);
        return response.data;
    },

    startClassroom: async (id: number) => {
        const response = await api.put<Classroom>(`/classrooms/${id}/start`);
        return response.data;
    },

    endClassroom: async (id: number) => {
        const response = await api.put<Classroom>(`/classrooms/${id}/end`);
        return response.data;
    },

    markAttendance: async (id: number) => {
        const response = await api.post('/attendance', { classroom_id: id });
        return response.data;
    },

    getMessages: async (id: number) => {
        const response = await api.get<ClassMessage[]>(`/classrooms/${id}/messages`);
        return response.data;
    },

    sendMessage: async (id: number, text: string) => {
        const response = await api.post<ClassMessage>(`/classrooms/${id}/messages`, { message_text: text, message_type: 'normal' });
        return response.data;
    }
};

export interface ClassMessage {
    id: number;
    classroom_id: number;
    user_id: number;
    message_text: string;
    message_type: 'normal' | 'system';
    created_at: string;
    user: {
        id: number;
        full_name: string;
        photo?: string;
    };
}
