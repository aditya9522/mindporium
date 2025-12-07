import { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service';
import { Loader2, MessageSquare, Star, User, TrendingUp, Brain, ThumbsUp, ThumbsDown, X, Edit, Trash2, Calendar, Mail } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { FeedbackModal } from '../../components/feedback/FeedbackModal';
import { DeleteConfirmationModal } from '../../components/modals/DeleteConfirmationModal';
import toast from 'react-hot-toast';
import api from '../../lib/axios';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

export const AdminFeedbackPage = () => {
    const [feedbacks, setFeedbacks] = useState<any[]>([]);
    const [analysis, setAnalysis] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedFeedback, setSelectedFeedback] = useState<any>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; feedback: any | null }>({
        isOpen: false,
        feedback: null
    });
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [feedbacksData, analysisData] = await Promise.all([
                adminService.getAppFeedbacks(),
                adminService.getAppFeedbackAnalysis()
            ]);
            setFeedbacks(feedbacksData);
            setAnalysis(analysisData);
        } catch (error) {
            console.error('Failed to load feedback data:', error);
            toast.error('Failed to load feedback data');
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (feedback: any) => {
        setSelectedFeedback(feedback);
        setIsDetailModalOpen(true);
    };

    const handleEdit = (feedback: any) => {
        setSelectedFeedback(feedback);
        setIsDetailModalOpen(false);
        setIsEditModalOpen(true);
    };

    const handleDelete = async () => {
        if (!deleteModal.feedback) return;

        setDeleting(true);
        try {
            await api.delete(`/feedback/app/${deleteModal.feedback.id}`);
            setFeedbacks(feedbacks.filter(f => f.id !== deleteModal.feedback.id));
            setDeleteModal({ isOpen: false, feedback: null });
            setIsDetailModalOpen(false);
            toast.success('Feedback deleted successfully');
            loadData(); // Reload to update stats
        } catch (error) {
            console.error('Failed to delete feedback:', error);
            toast.error('Failed to delete feedback');
        } finally {
            setDeleting(false);
        }
    };

    const getSentimentBadge = (rating: number) => {
        if (rating >= 4) {
            return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">Positive</span>;
        } else if (rating === 3) {
            return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">Neutral</span>;
        } else {
            return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">Negative</span>;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    // Prepare chart data
    const ratingData = analysis?.rating_distribution
        ? Object.entries(analysis.rating_distribution).map(([rating, count]) => ({
            rating: `${rating} Star${Number(rating) > 1 ? 's' : ''}`,
            count
        }))
        : [];

    const sentimentData = analysis?.sentiment_analysis
        ? [
            { name: 'Positive', value: analysis.sentiment_analysis.positive },
            { name: 'Neutral', value: analysis.sentiment_analysis.neutral },
            { name: 'Negative', value: analysis.sentiment_analysis.negative }
        ]
        : [];

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">App Feedback & Analysis</h1>
                    <p className="mt-2 text-gray-600">Comprehensive overview of user feedback and sentiment.</p>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-amber-50 rounded-lg">
                                <Star className="w-6 h-6 text-amber-600" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-gray-900">{analysis?.average_rating || 0}</div>
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
                                <div className="text-2xl font-bold text-gray-900">{analysis?.total_reviews || 0}</div>
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
                                <div className="text-2xl font-bold text-gray-900">{analysis?.sentiment_analysis?.positive || 0}</div>
                                <div className="text-sm text-gray-600">Positive Sentiment</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-red-50 rounded-lg">
                                <ThumbsDown className="w-6 h-6 text-red-600" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-gray-900">{analysis?.sentiment_analysis?.negative || 0}</div>
                                <div className="text-sm text-gray-600">Negative Sentiment</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Rating Distribution */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-indigo-600" />
                            Rating Distribution
                        </h3>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={ratingData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="rating" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Sentiment Analysis */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Brain className="w-5 h-5 text-purple-600" />
                            Sentiment Analysis (AI Powered)
                        </h3>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={sentimentData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {sentimentData.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="flex justify-center gap-4 mt-4">
                                {sentimentData.map((entry, index) => (
                                    <div key={entry.name} className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                        <span className="text-sm text-gray-600">{entry.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Detailed Feedbacks List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900">Recent Feedback</h3>
                    </div>

                    {feedbacks.length === 0 ? (
                        <div className="text-center py-12">
                            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900">No feedback yet</h3>
                            <p className="text-gray-500 mt-2">Wait for users to submit their thoughts.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {feedbacks.map((feedback) => (
                                <div
                                    key={feedback.id}
                                    className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                                    onClick={() => handleViewDetails(feedback)}
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3 flex-1">
                                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-sm">
                                                {feedback.user?.full_name?.charAt(0).toUpperCase() || <User className="w-5 h-5" />}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-medium text-gray-900">{feedback.user?.full_name || 'Anonymous'}</h3>
                                                <p className="text-xs text-gray-500">
                                                    {feedback.created_at ? formatDistanceToNow(new Date(feedback.created_at), { addSuffix: true }) : 'Recently'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {getSentimentBadge(feedback.rating)}
                                            <div className="flex items-center gap-1 bg-amber-50 px-3 py-1 rounded-full text-amber-600 border border-amber-100">
                                                <Star className="w-4 h-4 fill-current" />
                                                <span className="font-bold">{feedback.rating}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-gray-700 leading-relaxed line-clamp-2">
                                        {feedback.message || 'No comment provided'}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Detailed Feedback Modal */}
            {isDetailModalOpen && selectedFeedback && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-900">Feedback Details</h2>
                            <button
                                onClick={() => setIsDetailModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6">
                            {/* User Info */}
                            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
                                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                                    {selectedFeedback.user?.full_name?.charAt(0).toUpperCase() || <User className="w-8 h-8" />}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-gray-900">{selectedFeedback.user?.full_name || 'Anonymous User'}</h3>
                                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                                        <Mail className="w-4 h-4" />
                                        <span>{selectedFeedback.user?.email || 'No email'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Rating & Sentiment */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                                    <div className="text-sm text-amber-700 font-medium mb-2">Rating</div>
                                    <div className="flex items-center gap-2">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`w-6 h-6 ${i < selectedFeedback.rating
                                                    ? 'text-amber-500 fill-current'
                                                    : 'text-gray-300'
                                                    }`}
                                            />
                                        ))}
                                        <span className="text-2xl font-bold text-amber-600 ml-2">{selectedFeedback.rating}</span>
                                    </div>
                                </div>

                                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                                    <div className="text-sm text-blue-700 font-medium mb-2">Sentiment</div>
                                    <div className="text-2xl font-bold">
                                        {getSentimentBadge(selectedFeedback.rating)}
                                    </div>
                                </div>
                            </div>

                            {/* Feedback Message */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Feedback Message</label>
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                                    <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">
                                        {selectedFeedback.message || 'No comment provided'}
                                    </p>
                                </div>
                            </div>

                            {/* Metadata */}
                            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl">
                                <div>
                                    <div className="text-xs text-gray-500 mb-1">Feedback ID</div>
                                    <div className="font-mono text-sm text-gray-900">#{selectedFeedback.id}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500 mb-1">Submitted</div>
                                    <div className="text-sm text-gray-900 flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        {selectedFeedback.created_at
                                            ? format(new Date(selectedFeedback.created_at), 'PPpp')
                                            : 'Unknown'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 flex items-center justify-end gap-3">
                            <button
                                onClick={() => setIsDetailModalOpen(false)}
                                className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => handleEdit(selectedFeedback)}
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                            >
                                <Edit className="w-4 h-4" />
                                Edit
                            </button>
                            <button
                                onClick={() => {
                                    setDeleteModal({ isOpen: true, feedback: selectedFeedback });
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Feedback Modal */}
            <FeedbackModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    loadData(); // Reload data after edit
                }}
                type="app"
                existingFeedback={selectedFeedback}
            />

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, feedback: null })}
                onConfirm={handleDelete}
                title="Delete Feedback"
                message="Are you sure you want to delete this feedback? This action cannot be undone."
                itemName={`Feedback from ${deleteModal.feedback?.user?.full_name || 'Anonymous'}`}
                loading={deleting}
            />
        </div>
    );
};
