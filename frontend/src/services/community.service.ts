import api from '../lib/axios';
import type { Community, Post, Comment, CreateCommunityRequest, CreatePostRequest, CreateCommentRequest } from '../types/community';

export const communityService = {
    // Communities
    getCommunities: async (search?: string): Promise<Community[]> => {
        const params = search ? { search } : {};
        const response = await api.get<Community[]>('/communities/', { params });
        return response.data;
    },

    createCommunity: async (data: CreateCommunityRequest): Promise<Community> => {
        const response = await api.post<Community>('/communities/', data);
        return response.data;
    },

    getCommunity: async (id: number): Promise<Community> => {
        const response = await api.get<Community>(`/communities/${id}`);
        return response.data;
    },

    joinCommunity: async (id: number): Promise<void> => {
        await api.post(`/communities/${id}/join`);
    },

    leaveCommunity: async (id: number): Promise<void> => {
        await api.post(`/communities/${id}/leave`);
    },

    updateCommunity: async (id: number, data: Partial<CreateCommunityRequest>): Promise<Community> => {
        const response = await api.put<Community>(`/communities/${id}`, data);
        return response.data;
    },

    deleteCommunity: async (id: number): Promise<void> => {
        await api.delete(`/communities/${id}`);
    },

    getCommunityPosts: async (communityId: number, skip = 0, limit = 20): Promise<Post[]> => {
        const response = await api.get<Post[]>(`/communities/${communityId}/posts`, {
            params: { skip, limit }
        });
        return response.data;
    },

    // Posts
    createPost: async (data: CreatePostRequest): Promise<Post> => {
        const response = await api.post<Post>('/posts/', data);
        return response.data;
    },

    getPost: async (id: number): Promise<Post> => {
        const response = await api.get<Post>(`/posts/${id}`);
        return response.data;
    },

    likePost: async (id: number): Promise<{ message: string; like_count: number }> => {
        const response = await api.post<{ message: string; like_count: number }>(`/posts/${id}/like`);
        return response.data;
    },

    // Comments
    getComments: async (postId: number): Promise<Comment[]> => {
        const response = await api.get<Comment[]>(`/posts/${postId}/comments`);
        return response.data;
    },

    createComment: async (postId: number, content: string): Promise<Comment> => {
        const payload: CreateCommentRequest = { content };
        const response = await api.post<Comment>(`/posts/${postId}/comments`, payload);
        return response.data;
    }
};
