export interface AppFeedbackCreate {
    subject: string;
    message: string;
    rating?: number;
    category?: string;
}

export interface CourseFeedbackCreate {
    course_id: number;
    rating: number;
    review_text?: string;
}

export interface InstructorFeedbackCreate {
    instructor_id: number;
    rating: number;
    comments?: string;
}

export interface FeedbackResponse {
    id: number;
    user_id?: number;
    subject?: string;
    rating?: number;
    message?: string;
    review_text?: string;
    comments?: string;
    category?: string;
    status?: string;
    response?: string;
    created_at?: string;
    user?: {
        id: number;
        full_name: string;
        email: string;
    };
}
