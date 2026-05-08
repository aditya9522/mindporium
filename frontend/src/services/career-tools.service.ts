import api from '../lib/axios';
import type { ResumeData } from '../pages/student/resume-builder/types';

export interface JobMatchedResumeResult {
    matchScore: number;
    targetRole: string;
    missingKeywords: string[];
    strongKeywords: string[];
    rewriteNotes: string[];
    tailoredResumeData: ResumeData;
}

export interface InterviewQuestion {
    id: string;
    type: string;
    question: string;
    whatGoodLooksLike: string;
}

export interface InterviewQuestionResult {
    interviewTitle: string;
    focusAreas: string[];
    questions: InterviewQuestion[];
}

export interface InterviewFeedbackResult {
    score: number;
    verdict: string;
    strengths: string[];
    improvements: string[];
    betterAnswer: string;
    followUpQuestion: string;
}

export interface PortfolioResult {
    hero: {
        name: string;
        headline: string;
        summary: string;
        ctaText: string;
    };
    skills: string[];
    featuredProjects: {
        title: string;
        techStack: string;
        description: string;
        highlights: string[];
    }[];
    experienceHighlights: string[];
    education: string[];
    achievements: string[];
    contact: {
        email: string;
        linkedin: string;
        github: string;
        location: string;
    };
}

export const careerToolsService = {
    generateJobMatchedResume: async (
        resumeData: ResumeData,
        jobDescription: string,
        targetRole: string
    ): Promise<JobMatchedResumeResult> => {
        const response = await api.post<JobMatchedResumeResult>('/career-tools/job-match-resume', {
            resume_data: resumeData,
            job_description: jobDescription,
            target_role: targetRole,
        });
        return response.data;
    },

    generateInterviewQuestions: async (
        resumeData: ResumeData,
        targetRole: string,
        jobDescription: string,
        difficulty: string
    ): Promise<InterviewQuestionResult> => {
        const response = await api.post<InterviewQuestionResult>('/career-tools/interview/questions', {
            resume_data: resumeData,
            target_role: targetRole,
            job_description: jobDescription,
            difficulty,
        });
        return response.data;
    },

    generateInterviewFeedback: async (
        resumeData: ResumeData,
        targetRole: string,
        question: string,
        answer: string
    ): Promise<InterviewFeedbackResult> => {
        const response = await api.post<InterviewFeedbackResult>('/career-tools/interview/feedback', {
            resume_data: resumeData,
            target_role: targetRole,
            question,
            answer,
        });
        return response.data;
    },

    generatePortfolio: async (
        resumeData: ResumeData,
        headline: string,
        portfolioGoal: string
    ): Promise<PortfolioResult> => {
        const response = await api.post<PortfolioResult>('/career-tools/portfolio', {
            resume_data: resumeData,
            headline,
            portfolio_goal: portfolioGoal,
        });
        return response.data;
    },
};
