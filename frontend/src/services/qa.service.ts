import api from '../lib/axios';
import type { QAQuestion, QAAnswer, QuestionCreate, AnswerCreate } from '../types/qa';

export const qaService = {
    getSubjectQuestions: async (subjectId: number): Promise<QAQuestion[]> => {
        const response = await api.get<QAQuestion[]>(`/qa/questions/subject/${subjectId}`);
        return response.data;
    },

    askQuestion: async (data: QuestionCreate): Promise<QAQuestion> => {
        const response = await api.post<QAQuestion>('/qa/questions', data);
        return response.data;
    },

    answerQuestion: async (data: AnswerCreate): Promise<QAAnswer> => {
        const response = await api.post<QAAnswer>('/qa/answers', data);
        return response.data;
    },
};
