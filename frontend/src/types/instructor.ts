export interface InstructorDashboard {
    total_courses: number;
    total_students: number;
    total_revenue: number;
    active_courses: number;
    recent_enrollments: RecentEnrollment[];
    upcoming_classes: UpcomingClass[];
    course_stats: CourseStats[];
}

export interface RecentEnrollment {
    id: number;
    user_name: string;
    course_title: string;
    enrolled_at: string;
}

export interface UpcomingClass {
    id: number;
    title: string;
    subject_title: string;
    scheduled_at: string;
    duration_minutes: number;
    type: string;
}

export interface CourseStats {
    course_id: number;
    course_title: string;
    total_enrollments: number;
    active_students: number;
    completion_rate: number;
}

export interface CourseOverview {
    course: {
        id: number;
        title: string;
        description?: string;
        level: string;
        category: string;
        is_published: boolean;
        created_at?: string;
    };
    statistics: {
        total_enrollments: number;
        active_students: number;
        total_subjects: number;
        total_classes: number;
        total_tests: number;
        average_rating: number;
        total_feedback: number;
        recent_enrollments_7d: number;
        completion_rate: number;
    };
    subjects: Array<{
        subject_id: number;
        title: string;
        total_classes: number;
    }>;
    engagement: {
        active_student_rate: number;
    };
}
