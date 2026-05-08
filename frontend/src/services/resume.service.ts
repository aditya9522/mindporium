import api from '../lib/axios';
import type { ResumeData } from '../pages/student/resume-builder/types';

export interface ResumeImportResponse {
    data: ResumeData;
    source: {
        filename: string;
        contentType: string;
    };
}

export const resumeService = {
    importResume: async (file: File): Promise<ResumeImportResponse> => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post<ResumeImportResponse>('/resume/import', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data;
    },
};
