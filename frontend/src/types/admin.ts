export interface SystemStats {
    total_users: number;
    total_courses: number;
    total_classrooms: number;
    active_classrooms: number;
    total_communities: number;
}

export interface AdminDashboardData {
    stats: SystemStats;
    recent_users?: any[];
    recent_courses?: any[];
}

export interface SystemSetting {
    id: number;
    key: string;
    value: string;
    description?: string;
    is_public: boolean;
    created_at: string;
    updated_at: string;
}

export interface SystemSettingUpdate {
    value?: string;
    description?: string;
    is_public?: boolean;
}
