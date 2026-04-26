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

        if (type === 'app' && !comment.trim()) {
            toast.error('Please enter your feedback message');
            return;
        }

        if ((type === 'course' || type === 'instructor') && rating === 0) {
            toast.error('Please select a rating');
            return;
        }

        try {
            setSubmitting(true);

            if (existingFeedback) {
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300" role="dialog" aria-modal="true" aria-labelledby="feedback-modal-title">
            <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-300 relative border border-gray-100 dark:border-gray-800 transition-colors">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="text-center mb-8">
                    <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-600 dark:text-indigo-400 shadow-sm">
                        <MessageSquare className="w-7 h-7" />
                    </div>
                    <h2 id="feedback-modal-title" className="text-2xl font-bold text-gray-900 dark:text-gray-100">{getTitle()}</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">
                        Your feedback helps us improve the experience for everyone.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Star Rating */}
                    <div className="flex justify-center gap-3">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                className="focus:outline-none transition-all hover:scale-125 group active:scale-95"
                            >
                                <Star
                                    className={`w-10 h-10 transition-all duration-200 ${star <= (hoverRating || rating)
                                        ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]'
                                        : 'text-gray-200 dark:text-gray-800'
                                        }`}
                                />
                            </button>
                        ))}
                    </div>

                    {/* Comment */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 px-1">
                            Comments (Optional)
                        </label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows={4}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-500 outline-none resize-none text-gray-900 dark:text-gray-100 transition-all placeholder:text-gray-400"
                            placeholder="Tell us what you think..."
                        />
                    </div>

                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 font-bold transition-all active:scale-95"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting || (type === 'app' ? !comment.trim() : rating === 0)}
                            className="flex-1 px-4 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-200 dark:shadow-none flex items-center justify-center gap-2 active:scale-95 translate-y-0 hover:-translate-y-0.5"
                        >
                            {submitting ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                'Submit'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
