export const LevelEnum = {
    BEGINNER: "beginner",
    INTERMEDIATE: "intermediate",
    ADVANCED: "advanced",
} as const;
export type LevelEnum = typeof LevelEnum[keyof typeof LevelEnum];

export const CategoryEnum = {
    FREE: "free",
    PAID: "paid",
} as const;
export type CategoryEnum = typeof CategoryEnum[keyof typeof CategoryEnum];

export interface Course {
    id: number;
    title: string;
    description?: string;
    thumbnail?: string;
    level: LevelEnum;
    category: CategoryEnum;
    price?: number;
    tags?: string[];
    duration_weeks?: number;
    created_by: number;
    is_published: boolean;
    created_at?: string;
    updated_at?: string;
    enrollments_count?: number;
}

export interface CourseCreate {
    title: string;
    description?: string;
    thumbnail?: string;
    level: LevelEnum;
    category: CategoryEnum;
    price?: number;
    tags?: string[];
}

export interface CourseUpdate {
    title?: string;
    description?: string;
    thumbnail?: string;
    level?: LevelEnum;
    category?: CategoryEnum;
    price?: number;
    is_published?: boolean;
    tags?: string[];
}

export interface CourseFilters {
    search?: string;
    category?: CategoryEnum;
    level?: LevelEnum;
    skip?: number;
    limit?: number;
}
