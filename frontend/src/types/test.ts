export interface TestQuestion {
    id: number;
    test_id: number;
    question_text: string;
    question_type: 'mcq' | 'short_answer' | 'essay';
    options?: string[];
    correct_answer?: string;
    marks: number;
}

export interface Test {
    id: number;
    title: string;
    description?: string;
    subject_id?: number;
    classroom_id?: number;
    duration_minutes: number;
    total_marks: number;
    passing_marks: number;
    is_active: boolean;
    status: string;
    results_published: boolean;
    created_at: string;
    questions: TestQuestion[];
}

export interface TestCreate {
    title: string;
    description?: string;
    subject_id?: number;
    classroom_id?: number;
    duration_minutes: number;
    total_marks: number;
    passing_marks: number;
    questions: Omit<TestQuestion, 'id' | 'test_id'>[];
}

export interface Submission {
    id: number;
    test_id: number;
    user_id: number;
    answers: Record<string, string>;
    evaluation: Record<string, { is_correct: boolean; marks: number }>;
    obtained_marks: number;
    submitted_at: string;
    user?: {
        id: number;
        full_name: string;
        email: string;
        photo?: string;
    };
}

export interface SubmissionCreate {
    test_id: number;
    answers: Record<string, string>;
}
