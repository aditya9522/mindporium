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

export const newsService = {
    getTechNews: async (): Promise<NewsArticle[]> => {
        const response = await api.get('/news/');
        return response.data;
    }
};
