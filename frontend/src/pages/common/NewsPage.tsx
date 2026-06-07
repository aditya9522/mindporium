import { useEffect, useRef, useState } from 'react';
import { newsService, type NewsArticle } from '../../services/news.service';
import { format } from 'date-fns';
import { ArrowRight, Calendar, ChevronDown, Filter, Loader2, Newspaper, Search, Tag, Zap } from 'lucide-react';

const categories = [
    { value: 'technology', label: 'Technology' },
    { value: 'business', label: 'Business' },
    { value: 'science', label: 'Science' },
    { value: 'health', label: 'Health' },
    { value: 'general', label: 'General' },
];

const interests = ['AI', 'Cybersecurity', 'Cloud Computing', 'Data Science', 'Startups', 'Software Engineering'];
const PAGE_SIZE = 12;

export const NewsPage = () => {
    const [news, setNews] = useState<NewsArticle[]>([]);
    const [category, setCategory] = useState('technology');
    const [interest, setInterest] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState('');
    const sentinelRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        setPage(1);
        setNews([]);
        setHasMore(true);
    }, [category, interest, searchTerm]);

    useEffect(() => {
        let cancelled = false;
        const fetchNews = async () => {
            setError('');
            page === 1 ? setLoading(true) : setLoadingMore(true);
            try {
                const data = await newsService.getTechNews({
                    page,
                    pageSize: PAGE_SIZE,
                    category,
                    interest,
                    q: searchTerm.trim(),
                });
                if (cancelled) return;
                setNews((current) => page === 1 ? data.articles : [...current, ...data.articles]);
                setHasMore(data.has_more);
            } catch (fetchError) {
                if (!cancelled) {
                    console.error('Failed to load news', fetchError);
                    setError('News could not be loaded right now. Please try a different filter.');
                    setHasMore(false);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                    setLoadingMore(false);
                }
            }
        };

        fetchNews();
        return () => {
            cancelled = true;
        };
    }, [category, interest, page, searchTerm]);

    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel || loading || loadingMore || !hasMore) return;

        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setPage((current) => current + 1);
            }
        }, { rootMargin: '400px' });

        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [hasMore, loading, loadingMore]);

    const activeTopic = searchTerm.trim() || interest || categories.find((item) => item.value === category)?.label || 'Technology';

    return (
        <div className="relative min-h-screen overflow-hidden bg-slate-50 selection:bg-primary-100 selection:text-primary-900 dark:bg-gray-950 dark:selection:bg-primary-900 dark:selection:text-primary-100">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.18),transparent_34%),linear-gradient(180deg,rgba(99,102,241,0.12),transparent)]" />

            <section className="relative px-4 pt-16 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl border border-white/70 bg-white/85 shadow-[0_20px_80px_rgba(15,23,42,0.08)] backdrop-blur dark:border-gray-800 dark:bg-gray-900/85">
                    <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_380px]">
                        <div className="p-8 md:p-10">
                            <div className="inline-flex items-center gap-2 rounded-full border border-amber-100 bg-amber-50 px-3 py-1 text-xs font-black uppercase tracking-wide text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">
                                <Zap className="h-4 w-4 fill-amber-500 text-amber-500" />
                                Professional News Desk
                            </div>
                            <h1 className="mt-5 max-w-3xl text-4xl font-black tracking-tight text-slate-950 dark:text-white md:text-6xl">
                                Follow the signals that matter for your next move.
                            </h1>
                            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-gray-400">
                                Curated industry updates with categories, interest filters, search, and continuous scrolling for a smoother reading workflow.
                            </p>
                        </div>
                        <div className="border-t border-slate-100 bg-slate-50/80 p-8 dark:border-gray-800 dark:bg-gray-950/50 lg:border-l lg:border-t-0">
                            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Now Reading</p>
                            <p className="mt-3 text-2xl font-black text-slate-950 dark:text-white">{activeTopic}</p>
                            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-gray-400">Use interests for focused industry feeds, or search when you need a specific topic.</p>
                        </div>
                    </div>
                </div>
            </section>

            <main className="relative z-10 mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                <div className="mb-8 rounded-3xl border border-primary-100/70 bg-white/90 p-4 shadow-sm shadow-primary-900/5 backdrop-blur dark:border-primary-900/40 dark:bg-gray-900/90">
                    <div className="grid gap-3 lg:grid-cols-[1fr_220px_240px]">
                        <label className="relative block">
                            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-primary-500 dark:text-primary-300" />
                            <input
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                                placeholder="Search topics, companies, frameworks..."
                                className="h-12 w-full rounded-2xl border border-primary-100 bg-primary-50/40 pl-11 pr-4 text-sm font-semibold text-gray-900 outline-none transition placeholder:text-gray-400 hover:border-primary-200 hover:bg-white focus:border-primary-400 focus:bg-white focus:ring-4 focus:ring-primary-100 dark:[color-scheme:dark] dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100 dark:placeholder:text-gray-500 dark:hover:border-primary-800 dark:hover:bg-gray-950 dark:focus:border-primary-500 dark:focus:bg-gray-950 dark:focus:ring-primary-950/70"
                            />
                        </label>
                        <label className="relative block">
                            <Filter className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-primary-500 dark:text-primary-300" />
                            <select value={category} onChange={(event) => setCategory(event.target.value)} className="h-12 w-full appearance-none rounded-2xl border border-primary-100 bg-primary-50/40 pl-11 pr-10 text-sm font-black text-gray-900 outline-none transition hover:border-primary-200 hover:bg-white focus:border-primary-400 focus:bg-white focus:ring-4 focus:ring-primary-100 dark:[color-scheme:dark] dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100 dark:hover:border-primary-800 dark:hover:bg-gray-950 dark:focus:border-primary-500 dark:focus:bg-gray-950 dark:focus:ring-primary-950/70">
                                {categories.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-primary-500 dark:text-primary-300" />
                        </label>
                        <label className="relative block">
                            <Tag className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-primary-500 dark:text-primary-300" />
                            <select value={interest} onChange={(event) => setInterest(event.target.value)} className="h-12 w-full appearance-none rounded-2xl border border-primary-100 bg-primary-50/40 pl-11 pr-10 text-sm font-black text-gray-900 outline-none transition hover:border-primary-200 hover:bg-white focus:border-primary-400 focus:bg-white focus:ring-4 focus:ring-primary-100 dark:[color-scheme:dark] dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100 dark:hover:border-primary-800 dark:hover:bg-gray-950 dark:focus:border-primary-500 dark:focus:bg-gray-950 dark:focus:ring-primary-950/70">
                                <option value="">All interests</option>
                                {interests.map((item) => <option key={item} value={item}>{item}</option>)}
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-primary-500 dark:text-primary-300" />
                        </label>
                    </div>
                </div>

                {loading ? (
                    <NewsSkeleton />
                ) : error ? (
                    <div className="rounded-3xl border border-red-100 bg-red-50 p-8 text-center text-sm font-bold text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300">{error}</div>
                ) : news.length === 0 ? (
                    <div className="rounded-3xl border border-slate-100 bg-white p-12 text-center dark:border-gray-800 dark:bg-gray-900">
                        <Newspaper className="mx-auto h-12 w-12 text-slate-300" />
                        <p className="mt-4 text-lg font-black text-slate-950 dark:text-white">No articles found</p>
                        <p className="mt-2 text-sm text-slate-500">Try clearing search or choosing another interest.</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                            {news.map((article, index) => <NewsCard key={`${article.id}-${article.url}`} article={article} index={index} />)}
                        </div>
                        <div ref={sentinelRef} className="h-10" />
                        {loadingMore && (
                            <div className="mt-6 flex items-center justify-center gap-2 text-sm font-bold text-slate-500">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Loading more stories
                            </div>
                        )}
                        {!hasMore && (
                            <p className="mt-8 text-center text-sm font-bold text-slate-400">You are all caught up.</p>
                        )}
                    </>
                )}
            </main>
        </div>
    );
};

const NewsCard = ({ article, index }: { article: NewsArticle; index: number }) => (
    <article
        className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary-900/5 dark:border-gray-800 dark:bg-gray-900 dark:hover:shadow-black/20"
        style={{ animationDelay: `${Math.min(index, 12) * 60}ms` }}
    >
        <div className="relative h-56 overflow-hidden bg-slate-900">
            {article.image_url ? (
                <img src={article.image_url} alt={article.title} className="h-full w-full object-cover opacity-90 transition duration-700 group-hover:scale-105 group-hover:opacity-100" />
            ) : (
                <div className="flex h-full w-full items-center justify-center bg-primary-50 dark:bg-primary-900/10">
                    <Newspaper className="h-12 w-12 text-primary-200 dark:text-primary-800" />
                </div>
            )}
            <div className="absolute inset-0 bg-linear-to-t from-black/65 via-transparent to-transparent" />
            <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/95 px-3 py-1.5 text-xs font-black text-primary-700 shadow-sm backdrop-blur dark:bg-gray-900/95 dark:text-primary-300">
                <Tag className="h-3.5 w-3.5" />
                {article.technology || 'Tech'}
            </span>
        </div>
        <div className="flex flex-1 flex-col p-6">
            <div className="mb-4 flex flex-wrap items-center gap-3 text-xs font-bold text-slate-500 dark:text-gray-400">
                <span className="rounded-lg bg-primary-50 px-2 py-1 text-primary-700 dark:bg-primary-950/40 dark:text-primary-300">{article.source}</span>
                <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {format(new Date(article.published_at), 'MMM d, yyyy')}
                </span>
            </div>
            <h3 className="line-clamp-2 text-xl font-black leading-tight text-slate-950 transition group-hover:text-primary-600 dark:text-white dark:group-hover:text-primary-300">{article.title}</h3>
            <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600 dark:text-gray-400">{article.summary}</p>
            <button onClick={() => window.open(article.url, '_blank', 'noopener,noreferrer')} className="mt-auto flex w-full items-center justify-between border-t border-slate-100 pt-5 text-sm font-black text-slate-700 transition hover:text-primary-600 dark:border-gray-800 dark:text-gray-300 dark:hover:text-primary-300">
                Read full article
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-50 transition group-hover:translate-x-1 group-hover:bg-primary-50 dark:bg-gray-800 dark:group-hover:bg-primary-950">
                    <ArrowRight className="h-4 w-4" />
                </span>
            </button>
        </div>
    </article>
);

const NewsSkeleton = () => (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-[450px] animate-pulse overflow-hidden rounded-3xl border border-slate-100 bg-white dark:border-gray-800 dark:bg-gray-900">
                <div className="h-56 bg-slate-200 dark:bg-gray-800" />
                <div className="space-y-4 p-6">
                    <div className="h-4 w-1/3 rounded bg-slate-200 dark:bg-gray-800" />
                    <div className="h-6 rounded bg-slate-200 dark:bg-gray-800" />
                    <div className="h-6 w-5/6 rounded bg-slate-200 dark:bg-gray-800" />
                    <div className="h-20 rounded bg-slate-200 dark:bg-gray-800" />
                </div>
            </div>
        ))}
    </div>
);
