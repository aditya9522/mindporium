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
        <div className="max-w-7xl mx-auto space-y-8 py-8 px-4 sm:px-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Course Reviews</h1>
                    <p className="text-gray-500 mt-1">See what students are saying about this course</p>
                </div>
            </div>

            {/* Rating Overview */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <div className="flex flex-col md:flex-row gap-12 items-center">
                    <div className="flex flex-col items-center justify-center min-w-[200px] text-center">
                        <div className="text-6xl font-extrabold text-gray-900 mb-2">{averageRating}</div>
                        <div className="flex gap-1 mb-3">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    className={`w-6 h-6 ${star <= Number(averageRating)
                                        ? 'text-amber-400 fill-amber-400'
                                        : 'text-gray-200'
                                        }`}
                                />
                            ))}
                        </div>
                        <p className="text-gray-500 font-medium">{reviews.length} Ratings</p>
                    </div>

                    <div className="flex-1 w-full space-y-3 max-w-2xl">
                        {ratingDistribution.map(({ star, percentage }) => (
                            <div key={star} className="flex items-center gap-4">
                                <div className="flex items-center gap-1 w-12 text-sm font-medium text-gray-700">
                                    <span>{star}</span>
                                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                </div>
                                <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>
                                <div className="w-12 text-sm text-gray-500 text-right">
                                    {Math.round(percentage)}%
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Reviews List */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">Student Feedback ({reviews.length})</h2>
                    <div className="relative">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
                        >
                            <option value="newest">Newest First</option>
                            <option value="highest">Highest Rating</option>
                            <option value="lowest">Lowest Rating</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                    </div>
                </div>

                {reviews.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <MessageSquare className="w-8 h-8 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No reviews yet</h3>
                        <p className="text-gray-500 max-w-sm mx-auto mt-2">
                            Be the first to review this course after enrolling!
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {getSortedReviews().map((review) => (
                            <div key={review.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow flex flex-col h-full">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center overflow-hidden border border-indigo-100">
                                            {review.user.photo ? (
                                                <img src={getImageUrl(review.user.photo)} alt={review.user.full_name} className="w-full h-full object-cover" />
                                            ) : (
                                                <UserIcon className="w-5 h-5 text-indigo-600" />
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 text-sm">{review.user.full_name}</h4>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <div className="flex gap-0.5">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <Star
                                                            key={star}
                                                            className={`w-3 h-3 ${star <= review.rating
                                                                ? 'text-amber-400 fill-amber-400'
                                                                : 'text-gray-200'
                                                                }`}
                                                        />
                                                    ))}
                                                </div>
                                                <span className="text-xs text-gray-400">
                                                    • {new Date(review.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-gray-600 leading-relaxed mb-6 text-sm flex-1">
                                    {review.review_text}
                                </p>
                                <div className="flex items-center gap-4 pt-4 border-t border-gray-50 mt-auto">
                                    <button className="flex items-center gap-2 text-xs font-medium text-gray-500 hover:text-indigo-600 transition-colors">
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
    );
};
