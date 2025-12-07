import { useState, useEffect } from 'react';
import { Star, ThumbsUp, ThumbsDown, MessageSquare, TrendingUp, Brain } from 'lucide-react';
import api from '../../../lib/axios';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

interface FeedbacksTabProps {
    courseData: any;
}

export const FeedbacksTab = ({ courseData }: FeedbacksTabProps) => {
    const [feedbacks, setFeedbacks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (courseData?.course?.id) {
            fetchFeedbacks();
        }
    }, [courseData]);

    const fetchFeedbacks = async () => {
        try {
            const response = await api.get(`/feedback/course/${courseData.course.id}`);
            setFeedbacks(response.data);
        } catch (error) {
            console.error('Failed to fetch feedbacks:', error);
            toast.error('Failed to load feedbacks');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    // Calculate statistics
    const totalFeedbacks = feedbacks.length;
    const averageRating = totalFeedbacks > 0
        ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / totalFeedbacks
        : 0;

    // Rating distribution
    const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
        rating: `${rating} Star${rating > 1 ? 's' : ''}`,
        count: feedbacks.filter(f => f.rating === rating).length
    }));

    // Sentiment analysis (live calculation based on ratings)
    const sentimentData = [
        { name: 'Positive', value: feedbacks.filter(f => f.rating >= 4).length },
        { name: 'Neutral', value: feedbacks.filter(f => f.rating === 3).length },
        { name: 'Negative', value: feedbacks.filter(f => f.rating <= 2).length }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl shadow-xl p-6 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold mb-2">Course Feedbacks & Reviews</h2>
                        <p className="text-amber-100">Student ratings, reviews, and sentiment analysis</p>
                    </div>
                    <div className="text-center">
                        <div className="flex items-center gap-2 justify-center mb-1">
                            <Star className="w-8 h-8 fill-current" />
                            <span className="text-4xl font-bold">{averageRating.toFixed(1)}</span>
                        </div>
                        <div className="text-amber-100">{totalFeedbacks} reviews</div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-amber-50 rounded-lg">
                            <Star className="w-6 h-6 text-amber-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900">{averageRating.toFixed(1)}</div>
                            <div className="text-sm text-gray-600">Average Rating</div>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <MessageSquare className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900">{totalFeedbacks}</div>
                            <div className="text-sm text-gray-600">Total Reviews</div>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-50 rounded-lg">
                            <ThumbsUp className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900">
                                {feedbacks.filter(f => f.rating >= 4).length}
                            </div>
                            <div className="text-sm text-gray-600">Positive</div>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-red-50 rounded-lg">
                            <ThumbsDown className="w-6 h-6 text-red-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900">
                                {feedbacks.filter(f => f.rating <= 2).length}
                            </div>
                            <div className="text-sm text-gray-600">Negative</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Rating Distribution */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-indigo-600" />
                        Rating Distribution
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={ratingDistribution}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="rating" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="count" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Sentiment Analysis */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Brain className="w-5 h-5 text-purple-600" />
                        Sentiment Analysis
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={sentimentData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {sentimentData.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Reviews List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900">Student Reviews</h3>
                </div>

                {feedbacks.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                        <p>No reviews yet</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {feedbacks.map((feedback) => (
                            <div key={feedback.id} className="p-6 hover:bg-gray-50 transition-colors">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold">
                                            {feedback.user?.full_name?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                        <div>
                                            <div className="font-semibold text-gray-900">
                                                {feedback.user?.full_name || 'Anonymous'}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {feedback.created_at
                                                    ? formatDistanceToNow(new Date(feedback.created_at), { addSuffix: true })
                                                    : 'Recently'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`w-5 h-5 ${i < feedback.rating
                                                    ? 'text-amber-500 fill-current'
                                                    : 'text-gray-300'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                </div>
                                {feedback.review_text && (
                                    <p className="text-gray-700 leading-relaxed">{feedback.review_text}</p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
