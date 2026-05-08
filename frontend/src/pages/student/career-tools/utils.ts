import { initialResumeData, normalizeResumeData, type ResumeData } from '../resume-builder/types';

export const getResumeDraft = (): ResumeData => {
    const saved = localStorage.getItem('resume_draft');
    if (!saved) {
        return initialResumeData;
    }

    try {
        return normalizeResumeData(JSON.parse(saved));
    } catch {
        return initialResumeData;
    }
};

export const saveResumeDraft = (resumeData: ResumeData) => {
    localStorage.setItem('resume_draft', JSON.stringify(resumeData));
};

export const listItems = (items: string[]) => items.filter((item) => item.trim());
