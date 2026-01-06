import { useState, useEffect } from 'react';
import { newsService, type NewsArticle } from '../../services/news.service';
import { PageLoader } from '../../components/common/PageLoader';
import { format } from 'date-fns';
import { Tag, Calendar, Newspaper, ArrowRight, Zap } from 'lucide-react';

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
        <div className="min-h-screen bg-slate-50 relative selection:bg-indigo-100 selection:text-indigo-900">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-indigo-50/50 to-transparent pointer-events-none" />

            {/* Hero Section */}
            <div className="relative pt-20 pb-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto text-center space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-indigo-100 shadow-sm mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                        <span className="text-xs font-semibold text-indigo-900 tracking-wide uppercase">Daily Tech Updates</span>
                    </div>

                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
                        Stay Ahead of the <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Curve</span>
                    </h1>

                    <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                        Curated insights, breaking news, and deep dives into the technologies shaping the future of development.
                    </p>
                </div>
            </div>

            {/* Grid Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {news.map((article, index) => (
                        <div
                            key={article.id}
                            className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl hover:shadow-indigo-900/5 transition-all duration-300 flex flex-col h-full group animate-in fade-in zoom-in duration-500 fill-mode-backwards"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <div className="relative h-56 overflow-hidden bg-gray-900">
                                {article.image_url ? (
                                    <img
                                        src={article.image_url}
                                        alt={article.title}
                                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out opacity-90 group-hover:opacity-100"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-indigo-50 flex items-center justify-center">
                                        <Newspaper className="w-12 h-12 text-indigo-200" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                                <div className="absolute top-4 left-4">
                                    <span className="px-3 py-1.5 bg-white/95 backdrop-blur-md text-indigo-700 text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 border border-white/20">
                                        <Tag className="w-3.5 h-3.5" />
                                        {article.technology || 'Tech'}
                                    </span>
                                </div>
                            </div>

                            <div className="p-6 flex flex-col flex-grow">
                                <div className="flex items-center text-xs font-medium text-slate-500 mb-4 space-x-3">
                                    <span className="flex items-center text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                                        {article.source}
                                    </span>
                                    <span className="w-1 h-1 bg-slate-300 rounded-full" />
                                    <span className="flex items-center">
                                        <Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                                        {format(new Date(article.published_at), 'MMM d, yyyy')}
                                    </span>
                                </div>

                                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-tight">
                                    {article.title}
                                </h3>

                                <p className="text-slate-600 mb-6 text-sm line-clamp-3 leading-relaxed">
                                    {article.summary}
                                </p>

                                <div className="mt-auto pt-6 border-t border-slate-50">
                                    <button
                                        onClick={() => window.open(article.url, '_blank')}
                                        className="w-full group/btn flex items-center justify-between text-sm font-semibold text-slate-700 hover:text-indigo-600 transition-colors"
                                    >
                                        <span>Read Full Article</span>
                                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover/btn:bg-indigo-50 transition-colors group-hover/btn:translate-x-1 duration-300">
                                            <ArrowRight className="w-4 h-4" />
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
