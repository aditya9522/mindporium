export interface QAQuestion {
    id: number;
    subject_id: number;
    user_id: number;
    title: string;
    question_text: string;
    is_resolved: boolean;
    upvotes: number;
    created_at: string;
    updated_at?: string;
    user?: {
        id: number;
        full_name: string;
        email: string;
    };
    answers?: QAAnswer[];
}

export interface QAAnswer {
    id: number;
    question_id: number;
    user_id: number;
    answer_text: string;
    is_helpful: boolean;
    is_instructor_answer: boolean;
    upvotes: number;
    created_at: string;
    updated_at?: string;
    user?: {
        id: number;
        full_name: string;
        email: string;
    };
}

export interface QuestionCreate {
    subject_id: number;
    title: string;
    question_text: string;
}

export interface AnswerCreate {
    question_id: number;
    answer_text: string;
}
