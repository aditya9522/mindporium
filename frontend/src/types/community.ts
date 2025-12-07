export interface Community {
    id: number;
    name: string;
    description: string;
    slug: string;
    cover_image?: string;
    icon?: string;
    member_count: number;
    post_count: number;
    is_private: boolean;
    created_at: string;
    created_by: number;
    is_member?: boolean; // Helper for UI
}

export interface Post {
    id: number;
    community_id: number;
    user_id: number;
    title: string;
    content: string;
    media_url?: string;
    view_count: number;
    like_count: number;
    comment_count: number;
    is_pinned: boolean;
    created_at: string;
    user?: {
        id: number;
        full_name: string;
        avatar_url?: string;
    };
    is_liked?: boolean; // Helper for UI
}

export interface Comment {
    id: number;
    post_id: number;
    user_id: number;
    content: string;
    created_at: string;
    user?: {
        id: number;
        full_name: string;
        avatar_url?: string;
    };
}

export interface CreateCommunityRequest {
    name: string;
    description: string;
    is_private?: boolean;
}

export interface CreatePostRequest {
    community_id: number;
    title: string;
    content: string;
    media_url?: string;
}

export interface CreateCommentRequest {
    content: string;
}
