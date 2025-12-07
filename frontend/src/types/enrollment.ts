import type { Course } from './course';

export interface Enrollment {
    id: number;
    user_id: number;
    course_id: number;
    enrolled_at: string;
    progress?: number;
    course?: Course;
}

export interface EnrollmentCreate {
    course_id: number;
}

export type ResourceTypeEnum = "pdf" | "video" | "ppt" | "doc" | "link" | "image" | "other";

export interface Resource {
    id: number;
    title: string;
    description?: string;
    resource_type: ResourceTypeEnum;
    file_url?: string;
    external_link?: string;
    subject_id?: number;
    order_index: number;
    is_downloadable: boolean;
}

export interface Subject {
    id: number;
    title: string;
    description?: string;
    course_id: number;
    order_index: number;
    created_at?: string;
    updated_at?: string;
    resources?: Resource[];
    course_title?: string;
}

export interface SubjectCreate {
    title: string;
    description?: string;
    course_id: number;
    order_index: number;
}

export interface SubjectUpdate {
    title?: string;
    description?: string;
    order_index?: number;
}
