import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Star, MessageSquare, ThumbsUp, User as UserIcon, ChevronDown } from 'lucide-react';
import api from '../../lib/axios';
import { getImageUrl } from '../../lib/utils';
import { PageLoader } from '../../components/common/PageLoader';

interface Review {
    id: number;
    rating: number;
    review_text: string;
    created_at: string;
    user: {
        id: number;
        full_name: string;
        photo?: string;
    };
}

export const CourseReviewsPage = () => {
    const { id } = useParams();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState<'newest' | 'highest' | 'lowest'>('newest');

    useEffect(() => {
        if (id) {
            loadReviews();
        }
    }, [id]);

    const loadReviews = async () => {
        try {
            const response = await api.get(`/feedback/course/${id}`);
            setReviews(response.data);
        } catch (error) {
            console.error('Failed to load reviews:', error);
            // Don't show toast on 404/empty, just show empty state
        } finally {
            setLoading(false);
        }
    };

    const getSortedReviews = () => {
        return [...reviews].sort((a, b) => {
            if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            if (sortBy === 'highest') return b.rating - a.rating;
            if (sortBy === 'lowest') return a.rating - b.rating;
            return 0;
        });
    };

    const averageRating = reviews.length > 0
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
        : 0;

    const ratingDistribution = [5, 4, 3, 2, 1].map(star => {
        const count = reviews.filter(r => Math.round(r.rating) === star).length;
        const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
        return { star, count, percentage };
    });

    if (loading) {
        return <PageLoader />;
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 transition-colors duration-300">
            <div className="max-w-7xl mx-auto space-y-10 px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">Course Reviews</h1>
                        <p className="text-lg text-gray-500 dark:text-gray-400 mt-2 font-medium">See what students are saying about this course</p>
                    </div>
                </div>

                {/* Rating Overview */}
                <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-[0_2px_15px_rgb(0,0,0,0.04)] border border-gray-100 dark:border-gray-800 p-10">
                    <div className="flex flex-col md:flex-row gap-16 items-center text-center md:text-left">
                        <div className="flex flex-col items-center justify-center min-w-[200px]">
                            <div className="text-7xl font-black text-gray-900 dark:text-white mb-2 tracking-tighter">{averageRating}</div>
                            <div className="flex gap-1 mb-4">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        className={`w-6 h-6 ${star <= Number(averageRating)
                                            ? 'text-amber-400 fill-amber-400'
                                            : 'text-gray-200 dark:text-gray-800'
                                            }`}
                                    />
                                ))}
                            </div>
                            <p className="text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest text-sm">{reviews.length} Ratings</p>
                        </div>

                        <div className="flex-1 w-full space-y-4 max-w-2xl">
                            {ratingDistribution.map(({ star, percentage }) => (
                                <div key={star} className="flex items-center gap-6">
                                    <div className="flex items-center gap-2 w-16 text-sm font-bold text-gray-700 dark:text-gray-300">
                                        <span>{star} stars</span>
                                    </div>
                                    <div className="flex-1 h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-700 ease-out"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                    <div className="w-12 text-sm font-bold text-gray-400 dark:text-gray-500 text-right">
                                        {Math.round(percentage)}%
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Reviews List */}
                <div className="space-y-8">
                    <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-6">
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Student Feedback</h2>
                        <div className="relative group">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as any)}
                                className="pl-5 pr-12 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer group-hover:border-indigo-200 dark:group-hover:border-indigo-900 transition-all shadow-sm"
                            >
                                <option value="newest">Newest First</option>
                                <option value="highest">Highest Rating</option>
                                <option value="lowest">Lowest Rating</option>
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none group-hover:text-indigo-500 transition-colors" />
                        </div>
                    </div>

                    {reviews.length === 0 ? (
                        <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800">
                            <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <MessageSquare className="w-10 h-10 text-gray-300 dark:text-gray-700" />
                            </div>
                            <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">No reviews yet</h3>
                            <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto mt-2 font-medium">
                                Be the first to share your experience with this course after enrolling!
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {getSortedReviews().map((review) => (
                                <div key={review.id} className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-[0_2px_15px_rgb(0,0,0,0.04)] border border-gray-100 dark:border-gray-800 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:hover:shadow-indigo-900/10 transition-all duration-300 flex flex-col group">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center overflow-hidden border border-indigo-100 dark:border-indigo-800 group-hover:scale-110 transition-transform">
                                                {review.user.photo ? (
                                                    <img src={getImageUrl(review.user.photo)} alt={review.user.full_name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <UserIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="font-black text-gray-900 dark:text-white text-base tracking-tight">{review.user.full_name}</h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <div className="flex gap-0.5">
                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                            <Star
                                                                key={star}
                                                                className={`w-3 h-3 ${star <= review.rating
                                                                    ? 'text-amber-400 fill-amber-400'
                                                                    : 'text-gray-200 dark:text-gray-800'
                                                                    }`}
                                                            />
                                                        ))}
                                                    </div>
                                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                                        • {new Date(review.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="relative flex-1">
                                        <span className="absolute -top-4 -left-2 text-4xl text-gray-100 dark:text-gray-800 font-serif opacity-50">"</span>
                                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6 text-sm font-medium italic relative z-10 pt-2">
                                            {review.review_text}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4 pt-6 border-t border-gray-50 dark:border-gray-800 mt-auto">
                                        <button className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors uppercase tracking-widest">
                                            <ThumbsUp className="w-3.5 h-3.5" />
                                            <span>Helpful</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
