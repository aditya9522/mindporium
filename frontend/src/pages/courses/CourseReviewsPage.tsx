import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Star, MessageSquare, ThumbsUp, User as UserIcon, ChevronDown } from 'lucide-react';
import api from '../../lib/axios';
import { getImageUrl } from '../../lib/utils';
import { PageLoader } from '../../components/common/PageLoader';
import { formatNumber } from '../../lib/format';

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
        ? formatNumber(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length)
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
            <div className="max-w-7xl mx-auto space-y-8 px-4 sm:px-6 lg:px-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Course Reviews</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">See what students are saying about this course</p>
                </div>

                {/* Rating Overview */}
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-8">
                    <div className="flex flex-col md:flex-row gap-12 items-center">
                        <div className="flex flex-col items-center justify-center min-w-[180px]">
                            <div className="text-6xl font-bold text-gray-900 dark:text-white mb-3">{averageRating}</div>
                            <div className="flex gap-1 mb-3">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        className={`w-5 h-5 ${star <= Number(averageRating)
                                            ? 'text-amber-400 fill-amber-400'
                                            : 'text-gray-200 dark:text-gray-800'
                                            }`}
                                    />
                                ))}
                            </div>
                            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{reviews.length} {reviews.length === 1 ? 'Rating' : 'Ratings'}</p>
                        </div>

                        <div className="flex-1 w-full space-y-3 max-w-2xl">
                            {ratingDistribution.map(({ star, percentage }) => (
                                <div key={star} className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 w-20 text-sm font-medium text-gray-700 dark:text-gray-300">
                                        <span>{star}</span>
                                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                    </div>
                                    <div className="flex-1 h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary-500 dark:bg-primary-600 rounded-full transition-all duration-500"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                    <div className="w-12 text-sm font-medium text-gray-500 dark:text-gray-400 text-right">
                                        {Math.round(percentage)}%
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Reviews List */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Student Feedback</h2>
                        <div className="relative">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as any)}
                                className="pl-4 pr-10 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none cursor-pointer transition-colors"
                            >
                                <option value="newest">Newest First</option>
                                <option value="highest">Highest Rating</option>
                                <option value="lowest">Lowest Rating</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                    </div>

                    {reviews.length === 0 ? (
                        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                <MessageSquare className="w-8 h-8 text-gray-400 dark:text-gray-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No reviews yet</h3>
                            <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                                Be the first to share your experience with this course after enrolling!
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {getSortedReviews().map((review) => (
                                <div key={review.id} className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 hover:shadow-md transition-shadow">
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="w-12 h-12 rounded-full bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center overflow-hidden flex-shrink-0">
                                            {review.user.photo ? (
                                                <img src={getImageUrl(review.user.photo)} alt={review.user.full_name} className="w-full h-full object-cover" />
                                            ) : (
                                                <UserIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-semibold text-gray-900 dark:text-white">{review.user.full_name}</h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className="flex gap-0.5">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <Star
                                                            key={star}
                                                            className={`w-3.5 h-3.5 ${star <= review.rating
                                                                ? 'text-amber-400 fill-amber-400'
                                                                : 'text-gray-300 dark:text-gray-700'
                                                                }`}
                                                        />
                                                    ))}
                                                </div>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    {new Date(review.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4">
                                        {review.review_text}
                                    </p>
                                    <div className="flex items-center gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                                        <button className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                                            <ThumbsUp className="w-4 h-4" />
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
