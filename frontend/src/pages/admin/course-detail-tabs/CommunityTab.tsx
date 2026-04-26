import { useState, useEffect } from 'react';
import { qaService } from '../../../services/qa.service';
import type { QAQuestion } from '../../../types/qa';
import {
    MessageSquare, CheckCircle, Clock,
    Send, CheckCircle2, ChevronDown, ChevronUp,
    ThumbsUp, AlertCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { Skeleton } from '../../../components/ui/Skeleton';

interface CommunityTabProps {
    courseId: number;
}

export const CommunityTab = ({ courseId }: CommunityTabProps) => {
    const [loading, setLoading] = useState(true);
    const [questions, setQuestions] = useState<QAQuestion[]>([]);
    const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);
    const [answerText, setAnswerText] = useState<{ [key: number]: string }>({});
    const [isReplying, setIsReplying] = useState(false);
    const [isResolving, setIsResolving] = useState(false);

    useEffect(() => {
        fetchQuestions();
    }, [courseId]);

    const fetchQuestions = async () => {
        try {
            setLoading(true);
            const data = await qaService.getCourseQuestions(courseId);
            setQuestions(data);
        } catch (error) {
            console.error('Failed to fetch questions:', error);
            toast.error('Failed to load community questions');
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerQuestion = async (questionId: number) => {
        const text = answerText[questionId];
        if (!text?.trim()) {
            toast.error('Please enter an answer');
            return;
        }

        setIsReplying(true);
        try {
            const answer = await qaService.answerQuestion({
                question_id: questionId,
                answer_text: text,
            });

            setQuestions(questions.map(q => {
                if (q.id === questionId) {
                    return {
                        ...q,
                        answers: [...(q.answers || []), answer]
                    };
                }
                return q;
            }));

            setAnswerText({ ...answerText, [questionId]: '' });
            toast.success('Answer posted successfully');
        } catch (error) {
            console.error('Failed to answer question:', error);
            toast.error('Failed to post answer');
        } finally {
            setIsReplying(false);
        }
    };

    const handleResolveQuestion = async (questionId: number) => {
        setIsResolving(true);
        try {
            const updated = await qaService.resolveQuestion(questionId);
            setQuestions(questions.map(q => q.id === questionId ? updated : q));
            toast.success('Question marked as resolved');
        } catch (error) {
            console.error('Failed to resolve question:', error);
            toast.error('Failed to mark as resolved');
        } finally {
            setIsResolving(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-100 dark:border-gray-800 animate-pulse">
                        <Skeleton className="h-6 w-1/2 mb-4" />
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-3/4" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Course Community QA</h2>
                <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                        <CheckCircle2 className="w-4 h-4" />
                        {questions.filter(q => q.is_resolved).length} Resolved
                    </span>
                    <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                        <AlertCircle className="w-4 h-4" />
                        {questions.filter(q => !q.is_resolved).length} Open
                    </span>
                </div>
            </div>

            {questions.length === 0 ? (
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 p-12 text-center">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No questions yet</h3>
                    <p className="text-gray-500 dark:text-gray-400">Student questions will appear here.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {questions.map((question) => (
                        <div
                            key={question.id}
                            className={`bg-white dark:bg-gray-900 rounded-xl shadow-sm border transition-all duration-200 ${question.is_resolved
                                    ? 'border-green-100 dark:border-green-900/30'
                                    : 'border-gray-100 dark:border-gray-800'
                                }`}
                        >
                            <div className="p-6">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            {question.is_resolved && (
                                                <span className="flex items-center gap-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">
                                                    <CheckCircle2 className="w-3 h-3" />
                                                    Resolved
                                                </span>
                                            )}
                                            <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded">
                                                {question.subject?.title || 'Course Subject'}
                                            </span>
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{question.title}</h3>
                                        </div>
                                        <p className="text-gray-700 dark:text-gray-300 mb-4">{question.question_text}</p>

                                        <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-6 h-6 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center text-[10px] font-bold text-indigo-600">
                                                    {question.user?.full_name?.charAt(0) || 'A'}
                                                </div>
                                                <span>{question.user?.full_name || 'Anonymous'}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                <span>{formatDistanceToNow(new Date(question.created_at), { addSuffix: true })}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <ThumbsUp className="w-4 h-4" />
                                                <span>{question.upvotes || 0}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-2">
                                        {!question.is_resolved && (
                                            <button
                                                onClick={() => handleResolveQuestion(question.id)}
                                                disabled={isResolving}
                                                className="flex items-center gap-1 text-xs font-bold text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30 px-3 py-1.5 rounded-lg transition-colors border border-green-200 dark:border-green-800/30"
                                            >
                                                <CheckCircle className="w-3.5 h-3.5" />
                                                Mark Resolved
                                            </button>
                                        )}
                                        <button
                                            onClick={() => setExpandedQuestion(expandedQuestion === question.id ? null : question.id)}
                                            className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/30 px-3 py-1.5 rounded-lg transition-colors border border-indigo-200 dark:border-indigo-800/30"
                                        >
                                            {expandedQuestion === question.id ? (
                                                <>Hide Replies <ChevronUp className="w-3.5 h-3.5" /></>
                                            ) : (
                                                <>Show Replies ({question.answers?.length || 0}) <ChevronDown className="w-3.5 h-3.5" /></>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Expanded Answers */}
                                {expandedQuestion === question.id && (
                                    <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800 space-y-4">
                                        {question.answers && question.answers.length > 0 && (
                                            <div className="space-y-4 mb-6">
                                                {question.answers.map((answer) => (
                                                    <div key={answer.id} className="flex gap-3 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                                                        <div className="w-8 h-8 shrink-0 bg-linear-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm">
                                                            {answer.user?.full_name?.charAt(0) || 'I'}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="font-bold text-gray-900 dark:text-gray-100 text-sm">{answer.user?.full_name || 'Instructor'}</span>
                                                                {answer.is_instructor_answer && (
                                                                    <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">
                                                                        Staff
                                                                    </span>
                                                                )}
                                                                <span className="text-[10px] text-gray-500 dark:text-gray-400">
                                                                    {formatDistanceToNow(new Date(answer.created_at), { addSuffix: true })}
                                                                </span>
                                                            </div>
                                                            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{answer.answer_text}</p>
                                                            <div className="flex items-center gap-3 mt-2">
                                                                <span className="flex items-center gap-1 text-[10px] text-gray-500">
                                                                    <ThumbsUp className="w-3 h-3" /> {answer.upvotes || 0}
                                                                </span>
                                                                {answer.is_helpful && (
                                                                    <span className="flex items-center gap-1 text-[10px] text-green-600 font-bold">
                                                                        <CheckCircle2 className="w-3 h-3" /> Helpful
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Answer Input */}
                                        <div className="flex gap-3">
                                            <div className="w-8 h-8 shrink-0 bg-linear-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm">
                                                Me
                                            </div>
                                            <div className="flex-1 flex flex-col gap-2">
                                                <textarea
                                                    value={answerText[question.id] || ''}
                                                    onChange={(e) => setAnswerText({ ...answerText, [question.id]: e.target.value })}
                                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm h-24 resize-none"
                                                    placeholder="Write your professional response..."
                                                />
                                                <div className="flex justify-end">
                                                    <button
                                                        onClick={() => handleAnswerQuestion(question.id)}
                                                        disabled={isReplying || !answerText[question.id]?.trim()}
                                                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20"
                                                    >
                                                        <Send className="w-4 h-4" />
                                                        {isReplying ? 'Sending...' : 'Post Reply'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
