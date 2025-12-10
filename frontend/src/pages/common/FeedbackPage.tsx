import { useState, useEffect } from 'react';
import { MessageSquare, Send, Star, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface Feedback {
    id: number;
    subject: string;
    message: string;
    rating?: number;
    status: 'pending' | 'reviewed' | 'resolved';
    created_at: string;
    response?: string;
}

export const FeedbackPage = () => {
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);

    // Form state
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [rating, setRating] = useState(0);
    const [category, setCategory] = useState('general');

    useEffect(() => {
        loadFeedbacks();
    }, []);

    const loadFeedbacks = async () => {
        try {
            const response = await api.get('/feedback/my-feedback');
            setFeedbacks(response.data);
        } catch (error) {
            console.error('Failed to load feedbacks:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!subject.trim() || !message.trim()) {
            toast.error('Please fill in all required fields');
            return;
        }

        setSubmitting(true);
        try {
            await api.post('/feedback', {
                subject,
                message,
                rating: rating || null,
                category
            });
            toast.success('Feedback submitted successfully!');
            setSubject('');
            setMessage('');
            setRating(0);
            setCategory('general');
            setShowForm(false);
            loadFeedbacks();
        } catch (error) {
            toast.error('Failed to submit feedback');
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'resolved':
                return 'bg-green-100 text-green-800';
            case 'reviewed':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-yellow-100 text-yellow-800';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'resolved':
                return <CheckCircle className="w-4 h-4" />;
            case 'reviewed':
                return <AlertCircle className="w-4 h-4" />;
            default:
                return <MessageSquare className="w-4 h-4" />;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-indigo-100 rounded-xl">
                                <MessageSquare className="w-6 h-6 text-indigo-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Feedback & Support</h1>
                                <p className="text-sm text-gray-600">Share your thoughts and get help</p>
                            </div>
                        </div>
                        <Button
                            onClick={() => setShowForm(!showForm)}
                            className="flex items-center gap-2"
                        >
                            <MessageSquare className="w-4 h-4" />
                            {showForm ? 'Cancel' : 'New Feedback'}
                        </Button>
                    </div>

                    {/* Feedback Form */}
                    {showForm && (
                        <form onSubmit={handleSubmit} className="mt-6 p-6 bg-gray-50 rounded-xl border border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Submit Feedback</h3>

                            <div className="space-y-4">
                                {/* Category */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Category
                                    </label>
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    >
                                        <option value="general">General Feedback</option>
                                        <option value="bug">Bug Report</option>
                                        <option value="feature">Feature Request</option>
                                        <option value="course">Course Related</option>
                                        <option value="support">Technical Support</option>
                                    </select>
                                </div>

                                {/* Subject */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Subject <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        placeholder="Brief summary of your feedback"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        required
                                    />
                                </div>

                                {/* Message */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Message <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Provide detailed information..."
                                        rows={5}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                                        required
                                    />
                                </div>

                                {/* Rating */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Overall Rating (Optional)
                                    </label>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setRating(star)}
                                                className="transition-transform hover:scale-110"
                                            >
                                                <Star
                                                    className={`w-8 h-8 ${star <= rating
                                                        ? 'fill-yellow-400 text-yellow-400'
                                                        : 'text-gray-300'
                                                        }`}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <div className="flex gap-3 pt-4">
                                    <Button
                                        type="submit"
                                        disabled={submitting}
                                        className="flex-1 flex items-center justify-center gap-2"
                                    >
                                        {submitting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Submitting...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="w-4 h-4" />
                                                Submit Feedback
                                            </>
                                        )}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setShowForm(false)}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        </form>
                    )}
                </div>

                {/* Feedback History */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-900">Your Feedback History</h2>

                    {feedbacks.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No feedback yet</h3>
                            <p className="text-gray-600 mb-4">
                                Share your thoughts to help us improve!
                            </p>
                            <Button onClick={() => setShowForm(true)}>
                                Submit Your First Feedback
                            </Button>
                        </div>
                    ) : (
                        feedbacks.map((feedback) => (
                            <div
                                key={feedback.id}
                                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {feedback.subject}
                                            </h3>
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(
                                                    feedback.status
                                                )}`}
                                            >
                                                {getStatusIcon(feedback.status)}
                                                {feedback.status.toUpperCase()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-3">{feedback.message}</p>
                                        {feedback.rating && (
                                            <div className="flex items-center gap-1 mb-2">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`w-4 h-4 ${i < feedback.rating!
                                                            ? 'fill-yellow-400 text-yellow-400'
                                                            : 'text-gray-300'
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                        <p className="text-xs text-gray-500">
                                            Submitted on {format(new Date(feedback.created_at), 'MMM d, yyyy • h:mm a')}
                                        </p>
                                    </div>
                                </div>

                                {/* Admin Response */}
                                {feedback.response && (
                                    <div className="mt-4 p-4 bg-indigo-50 rounded-lg border-l-4 border-indigo-600">
                                        <p className="text-sm font-semibold text-indigo-900 mb-1">
                                            Response from Admin:
                                        </p>
                                        <p className="text-sm text-indigo-800">{feedback.response}</p>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
