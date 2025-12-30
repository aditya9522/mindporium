// import api from '../lib/axios';

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

// Mock data for now since we don't have a real backend endpoint for news yet
const MOCK_NEWS: NewsArticle[] = [
    {
        id: 1,
        title: "The Future of React: Server Components and Beyond",
        summary: "Explore how React Server Components are changing the way we build web applications, improving performance and developer experience.",
        url: "#",
        source: "TechDaily",
        published_at: new Date().toISOString(),
        technology: "React",
        image_url: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=60"
    },
    {
        id: 2,
        title: "Python 4.0: What We Know So Far",
        summary: "Rumors and confirmed features for the next major version of Python. Will it break backward compatibility again?",
        url: "#",
        source: "CodeWorld",
        published_at: new Date(Date.now() - 86400000).toISOString(),
        technology: "Python",
        image_url: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&auto=format&fit=crop&q=60"
    },
    {
        id: 3,
        title: "AI in Coding: Friend or Foe?",
        summary: "How AI tools like Copilot and Gemini are impacting the job market for junior developers.",
        url: "#",
        source: "DevDigest",
        published_at: new Date(Date.now() - 172800000).toISOString(),
        technology: "AI",
        image_url: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop&q=60"
    },
    {
        id: 4,
        title: "Understanding FastAPI's Async Capabilities",
        summary: "A deep dive into how FastAPI handles asynchronous requests and why it's becoming the go-to framework for Python APIs.",
        url: "#",
        source: "PythonFancy",
        published_at: new Date(Date.now() - 259200000).toISOString(),
        technology: "FastAPI",
        image_url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=60"
    },
    {
        id: 5,
        title: "TypeScript 5.4 Release Notes",
        summary: "New features including NoInfer utility type, improved type narrowing in closures, and more.",
        url: "#",
        source: "TS Weekly",
        published_at: new Date(Date.now() - 345600000).toISOString(),
        technology: "TypeScript",
        image_url: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&auto=format&fit=crop&q=60"
    }
];

export const newsService = {
    getTechNews: async (): Promise<NewsArticle[]> => {
        // Simulate API call
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(MOCK_NEWS);
            }, 800);
        });
    }
};
