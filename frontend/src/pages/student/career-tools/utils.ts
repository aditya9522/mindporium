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

export const toText = (value: unknown): string => {
    if (typeof value === 'string') {
        return value;
    }

    if (value === null || value === undefined) {
        return '';
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
        return String(value);
    }

    if (Array.isArray(value)) {
        return value.map(toText).filter(Boolean).join(', ');
    }

    if (typeof value === 'object') {
        const record = value as Record<string, unknown>;
        const preferred = record.name ?? record.title ?? record.text ?? record.value ?? record.description ?? record.items;
        if (preferred !== undefined) {
            return toText(preferred);
        }
        return Object.values(record).map(toText).filter(Boolean).join(' ');
    }

    return '';
};

export const listItems = (items: unknown): string[] => {
    if (!Array.isArray(items)) {
        const item = toText(items).trim();
        return item ? [item] : [];
    }

    return items.map((item) => toText(item).trim()).filter(Boolean);
};
