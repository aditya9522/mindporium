import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Star, MessageSquare, ThumbsUp, User as UserIcon, Loader2 } from 'lucide-react';
import api from '../../lib/axios';

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
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 py-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Course Reviews</h1>
                    <p className="text-gray-500 mt-1">See what students are saying about this course</p>
                </div>
            </div>

            {/* Rating Overview */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col md:flex-row gap-8">
                    <div className="flex flex-col items-center justify-center p-4 min-w-[200px]">
                        <div className="text-5xl font-bold text-gray-900 mb-2">{averageRating}</div>
                        <div className="flex gap-1 mb-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    className={`w-5 h-5 ${star <= Number(averageRating)
                                        ? 'text-yellow-400 fill-yellow-400'
                                        : 'text-gray-200'
                                        }`}
                                />
                            ))}
                        </div>
                        <p className="text-sm text-gray-500">{reviews.length} Ratings</p>
                    </div>

                    <div className="flex-1 space-y-3">
                        {ratingDistribution.map(({ star, percentage }) => (
                            <div key={star} className="flex items-center gap-3">
                                <div className="flex items-center gap-1 w-16 text-sm text-gray-600">
                                    <span>{star}</span>
                                    <Star className="w-3 h-3 text-gray-400" />
                                </div>
                                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-indigo-500 rounded-full"
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
                    <h2 className="text-lg font-bold text-gray-900">Reviews ({reviews.length})</h2>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="newest">Newest First</option>
                        <option value="highest">Highest Rating</option>
                        <option value="lowest">Lowest Rating</option>
                    </select>
                </div>

                {reviews.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                        <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">No reviews yet</h3>
                        <p className="text-gray-500 max-w-sm mx-auto mt-2">
                            Be the first to review this course after enrolling!
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {getSortedReviews().map((review) => (
                            <div key={review.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden">
                                            {review.user.photo ? (
                                                <img src={review.user.photo} alt={review.user.full_name} className="w-full h-full object-cover" />
                                            ) : (
                                                <UserIcon className="w-5 h-5 text-indigo-600" />
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900">{review.user.full_name}</h4>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <div className="flex gap-0.5">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <Star
                                                            key={star}
                                                            className={`w-3.5 h-3.5 ${star <= review.rating
                                                                ? 'text-yellow-400 fill-yellow-400'
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
                                <p className="text-gray-600 leading-relaxed mb-4">
                                    {review.review_text}
                                </p>
                                <div className="flex items-center gap-4">
                                    <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 transition-colors">
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
    );
};
