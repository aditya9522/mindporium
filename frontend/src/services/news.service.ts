import api from '../lib/axios';

export interface NewsArticle {
    id: number;
    title: string;
    summary: string;
    url: string;
    source: string;
    published_at: string;
    image_url?: string;
    technology?: string;
}

export interface NewsFeedResponse {
    articles: NewsArticle[];
    page: number;
    page_size: number;
    total_results: number;
    has_more: boolean;
    category: string;
    interest?: string | null;
}

export interface NewsQuery {
    page?: number;
    pageSize?: number;
    category?: string;
    interest?: string;
    q?: string;
}

export const newsService = {
    getTechNews: async (query: NewsQuery = {}): Promise<NewsFeedResponse> => {
        const response = await api.get('/news/', {
            params: {
                page: query.page ?? 1,
                page_size: query.pageSize ?? 12,
                category: query.category,
                interest: query.interest || undefined,
                q: query.q || undefined,
            },
        });
        return response.data;
    }
};
