import { useState, useEffect } from 'react';
import { feedbackService } from '../../services/feedback.service';
import { Star, X, Loader2, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: 'app' | 'course' | 'instructor';
    targetId?: number; // course_id or instructor_id
    title?: string; // e.g. "Rate this Course"
    existingFeedback?: any; // Existing feedback for editing
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
    isOpen,
    onClose,
    type,
    targetId,
    title,
    existingFeedback
}) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [hoverRating, setHoverRating] = useState(0);
    const [submitting, setSubmitting] = useState(false);

    // Populate form when editing
    useEffect(() => {
        if (existingFeedback) {
            setRating(existingFeedback.rating || 0);
            setComment(existingFeedback.message || existingFeedback.review_text || existingFeedback.comments || '');
        } else {
            setRating(0);
            setComment('');
        }
    }, [existingFeedback, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // For app feedback, rating is optional but subject and message are required
        if (type === 'app' && !comment.trim()) {
            toast.error('Please enter your feedback message');
            return;
        }

        // For course and instructor feedback, rating is required
        if ((type === 'course' || type === 'instructor') && rating === 0) {
            toast.error('Please select a rating');
            return;
        }

        try {
            setSubmitting(true);

            if (existingFeedback) {
                // Update existing feedback
                if (type === 'app') {
                    await feedbackService.updateAppFeedback(existingFeedback.id, {
                        subject: 'General Feedback',
                        message: comment,
                        rating: rating || undefined,
                        category: 'general'
                    });
                } else if (type === 'course' && targetId) {
                    await feedbackService.updateCourseFeedback(existingFeedback.id, { course_id: targetId, rating, review_text: comment });
                } else if (type === 'instructor' && targetId) {
                    await feedbackService.updateInstructorFeedback(existingFeedback.id, { instructor_id: targetId, rating, comments: comment });
                }
                toast.success('Feedback updated successfully!');
            } else {
                // Create new feedback
                if (type === 'app') {
                    await feedbackService.submitAppFeedback({
                        subject: 'General Feedback',
                        message: comment,
                        rating: rating || undefined,
                        category: 'general'
                    });
                } else if (type === 'course' && targetId) {
                    await feedbackService.submitCourseFeedback({ course_id: targetId, rating, review_text: comment });
                } else if (type === 'instructor' && targetId) {
                    await feedbackService.submitInstructorFeedback({ instructor_id: targetId, rating, comments: comment });
                }
                toast.success('Thank you for your feedback!');
            }

            onClose();
            setRating(0);
            setComment('');
        } catch (error) {
            console.error('Failed to submit feedback:', error);
            toast.error('Failed to submit feedback');
        } finally {
            setSubmitting(false);
        }
    };

    const getTitle = () => {
        if (title) return title;
        const prefix = existingFeedback ? 'Edit' : 'Send';
        switch (type) {
            case 'app': return `${prefix} Feedback`;
            case 'course': return existingFeedback ? 'Edit Course Rating' : 'Rate this Course';
            case 'instructor': return existingFeedback ? 'Edit Instructor Rating' : 'Rate Instructor';
            default: return 'Feedback';
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl animate-in zoom-in-95 duration-200 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="text-center mb-6">
                    <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-3 text-indigo-600">
                        <MessageSquare className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">{getTitle()}</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Your feedback helps us improve the experience for everyone.
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Star Rating */}
                    <div className="flex justify-center gap-2 mb-6">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                className="focus:outline-none transition-transform hover:scale-110"
                            >
                                <Star
                                    className={`w-8 h-8 ${star <= (hoverRating || rating)
                                        ? 'fill-amber-400 text-amber-400'
                                        : 'text-gray-300'
                                        }`}
                                />
                            </button>
                        ))}
                    </div>

                    {/* Comment */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Comments (Optional)
                        </label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows={4}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none text-sm"
                            placeholder="Tell us what you think..."
                        />
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting || (type === 'app' ? !comment.trim() : rating === 0)}
                            className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                        >
                            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                            Submit Feedback
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
