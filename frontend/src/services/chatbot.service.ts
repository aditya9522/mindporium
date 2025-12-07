import api from '../lib/axios';
import type { ChatSession, ChatMessage, CreateMessageRequest } from '../types/chatbot';

export const chatbotService = {
    // Get all chat sessions
    getSessions: async (): Promise<ChatSession[]> => {
        const response = await api.get<ChatSession[]>('/chatbot/sessions');
        return response.data;
    },

    // Create a new session
    createSession: async (): Promise<ChatSession> => {
        const response = await api.post<ChatSession>('/chatbot/sessions');
        return response.data;
    },

    // Get a specific session
    getSession: async (sessionId: number): Promise<ChatSession> => {
        const response = await api.get<ChatSession>(`/chatbot/sessions/${sessionId}`);
        return response.data;
    },

    // Send a message
    sendMessage: async (sessionId: number, content: string): Promise<ChatMessage> => {
        const payload: CreateMessageRequest = { content };
        const response = await api.post<ChatMessage>(`/chatbot/sessions/${sessionId}/messages`, payload);
        return response.data;
    },

    updateSession: async (sessionId: number, title: string): Promise<ChatSession> => {
        const response = await api.put<ChatSession>(`/chatbot/sessions/${sessionId}`, null, { params: { title } });
        return response.data;
    },

    deleteSession: async (sessionId: number): Promise<void> => {
        await api.delete(`/chatbot/sessions/${sessionId}`);
    }
};
