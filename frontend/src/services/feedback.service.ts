import api from '../lib/axios';
import type { AppFeedbackCreate, CourseFeedbackCreate, InstructorFeedbackCreate, FeedbackResponse } from '../types/feedback';

export const feedbackService = {
    submitAppFeedback: async (data: AppFeedbackCreate): Promise<FeedbackResponse> => {
        const response = await api.post<FeedbackResponse>('/feedback/app', data);
        return response.data;
    },

    submitCourseFeedback: async (data: CourseFeedbackCreate): Promise<FeedbackResponse> => {
        const response = await api.post<FeedbackResponse>('/feedback/course', data);
        return response.data;
    },

    submitInstructorFeedback: async (data: InstructorFeedbackCreate): Promise<FeedbackResponse> => {
        const response = await api.post<FeedbackResponse>('/feedback/instructor', data);
        return response.data;
    },

    updateAppFeedback: async (feedbackId: number, data: AppFeedbackCreate): Promise<FeedbackResponse> => {
        const response = await api.put<FeedbackResponse>(`/feedback/app/${feedbackId}`, data);
        return response.data;
    },

    updateCourseFeedback: async (feedbackId: number, data: CourseFeedbackCreate): Promise<FeedbackResponse> => {
        const response = await api.put<FeedbackResponse>(`/feedback/course/${feedbackId}`, data);
        return response.data;
    },

    updateInstructorFeedback: async (feedbackId: number, data: InstructorFeedbackCreate): Promise<FeedbackResponse> => {
        const response = await api.put<FeedbackResponse>(`/feedback/instructor/${feedbackId}`, data);
        return response.data;
    },

    getInstructorFeedbacks: async (skip: number = 0, limit: number = 100): Promise<FeedbackResponse[]> => {
        const response = await api.get<FeedbackResponse[]>('/feedback/instructor', { params: { skip, limit } });
        return response.data;
    },

    getCourseFeedbacks: async (courseId: number, skip: number = 0, limit: number = 100): Promise<FeedbackResponse[]> => {
        const response = await api.get<FeedbackResponse[]>(`/feedback/course/${courseId}`, { params: { skip, limit } });
        return response.data;
    }
};
