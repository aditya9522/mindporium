import { useState, useEffect } from 'react';
import { newsService, type NewsArticle } from '../../services/news.service';
import { PageLoader } from '../../components/common/PageLoader';
import { format } from 'date-fns';
import { ExternalLink, Tag, Calendar, Newspaper } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const NewsPage = () => {
    const [news, setNews] = useState<NewsArticle[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const data = await newsService.getTechNews();
                setNews(data);
            } catch (error) {
                console.error('Failed to load news');
            } finally {
                setLoading(false);
            }
        };
        fetchNews();
    }, []);

    if (loading) return <PageLoader />;

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">Tech Stack News</h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Stay updated with the latest trends, updates, and articles from the developer community.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {news.map((article) => (
                        <div key={article.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col h-full group">
                            <div className="relative h-48 overflow-hidden">
                                {article.image_url ? (
                                    <img
                                        src={article.image_url}
                                        alt={article.title}
                                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-indigo-50 flex items-center justify-center">
                                        <Newspaper className="w-12 h-12 text-indigo-200" />
                                    </div>
                                )}
                                <div className="absolute top-4 left-4">
                                    <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-indigo-600 text-xs font-bold rounded-full shadow-sm flex items-center gap-1">
                                        <Tag className="w-3 h-3" />
                                        {article.technology}
                                    </span>
                                </div>
                            </div>

                            <div className="p-6 flex flex-col flex-grow">
                                <div className="flex items-center text-xs text-gray-500 mb-3 space-x-2">
                                    <span className="flex items-center font-medium text-indigo-500">
                                        {article.source}
                                    </span>
                                    <span>•</span>
                                    <span className="flex items-center">
                                        <Calendar className="w-3 h-3 mr-1" />
                                        {format(new Date(article.published_at), 'MMM d, yyyy')}
                                    </span>
                                </div>

                                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors line-clamp-2">
                                    {article.title}
                                </h3>

                                <p className="text-gray-600 mb-6 text-sm line-clamp-3">
                                    {article.summary}
                                </p>

                                <div className="mt-auto">
                                    <Button variant="outline" className="w-full justify-between group-hover:border-indigo-200 group-hover:bg-indigo-50/50" onClick={() => window.open(article.url, '_blank')}>
                                        Read Article
                                        <ExternalLink className="w-4 h-4 ml-2 opacity-50 group-hover:opacity-100 transition-opacity" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
