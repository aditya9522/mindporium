import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { MessageSquare, ThumbsUp, MessageCircle, Plus, ChevronDown, ChevronUp, Send, X } from 'lucide-react';
import api from '../../lib/axios';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';
import { getImageUrl } from '../../lib/utils';
import { PageLoader } from '../../components/common/PageLoader';

interface User {
    id: number;
    full_name: string;
    photo?: string;
}

interface Answer {
    id: number;
    answer_text: string;
    user: User;
    created_at: string;
    is_instructor_answer: boolean;
}

interface Question {
    id: number;
    title: string;
    question_text: string;
    subject_id: number;
    user: User;
    created_at: string;
    answers: Answer[];
    upvotes: number;
}

interface Subject {
    id: number;
    title: string;
}

export const CourseQAPage = () => {
    const { id } = useParams();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form State
    const [newTitle, setNewTitle] = useState('');
    const [newQuestion, setNewQuestion] = useState('');
    const [selectedSubjectId, setSelectedSubjectId] = useState<number | ''>('');
    const [activeFilter, setActiveFilter] = useState<number | 'all'>('all');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reply State
    const [expandedQuestions, setExpandedQuestions] = useState<number[]>([]);
    const [replyingTo, setReplyingTo] = useState<number | null>(null);
    const [replyText, setReplyText] = useState('');
    const [isReplying, setIsReplying] = useState(false);

    useEffect(() => {
        if (id) {
            loadData();
        }
    }, [id]);

    const loadData = async () => {
        try {
            const [qRes, sRes] = await Promise.all([
                api.get(`/qa/questions/course/${id}`),
                api.get(`/subjects/course/${id}`)
            ]);
            setQuestions(qRes.data);
            setSubjects(sRes.data);
            if (sRes.data.length > 0) setSelectedSubjectId(sRes.data[0].id);
        } catch (error) {
            console.error('Failed to load QA data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAskQuestion = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);
        try {
            await api.post('/qa/questions', {
                title: newTitle,
                question_text: newQuestion,
                subject_id: selectedSubjectId
            });
            toast.success('Question posted successfully!');
            setIsModalOpen(false);
            setNewTitle('');
            setNewQuestion('');
            loadData();
        } catch (error) {
            toast.error('Failed to post question');
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleExpand = (qId: number) => {
        setExpandedQuestions(prev =>
            prev.includes(qId) ? prev.filter(id => id !== qId) : [...prev, qId]
        );
    };

    const handlePostReply = async (questionId: number) => {
        if (!replyText.trim() || isReplying) return;

        setIsReplying(true);
        try {
            await api.post('/qa/answers', {
                question_id: questionId,
                answer_text: replyText
            });
            toast.success('Reply posted');
            setReplyingTo(null);
            setReplyText('');
            loadData();
            if (!expandedQuestions.includes(questionId)) {
                setExpandedQuestions(prev => [...prev, questionId]);
            }
        } catch (error) {
            toast.error('Failed to post reply');
        } finally {
            setIsReplying(false);
        }
    };

    const getSubjectName = (subjectId: number) => {
        return subjects.find(s => s.id === subjectId)?.title || 'Unknown Subject';
    };

    if (loading) {
        return <PageLoader />;
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 py-8 px-4 sm:px-6">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Left Sidebar - Filters & Actions */}
                <div className="w-full md:w-64 flex-shrink-0 space-y-6">
                    <div>
                        <Button onClick={() => setIsModalOpen(true)} className="w-full shadow-lg shadow-primary-200 dark:shadow-primary-900/30">
                            <Plus className="w-4 h-4 mr-2" />
                            Ask Question
                        </Button>
                    </div>

                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-4 transition-colors duration-300">
                        <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-3 px-2">Topics</h3>
                        <div className="space-y-1">
                            <button
                                onClick={() => setActiveFilter('all')}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeFilter === 'all'
                                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                                    }`}
                            >
                                All Subjects
                            </button>
                            {subjects.map(subject => (
                                <button
                                    key={subject.id}
                                    onClick={() => setActiveFilter(subject.id)}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeFilter === subject.id
                                        ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                                        }`}
                                >
                                    {subject.title}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 min-w-0">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Course Community</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Ask questions and discuss topics with your peers</p>
                    </div>

                    {isModalOpen && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                            <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">
                                {/* Header */}
                                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Ask a Question</h3>
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-all"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <form onSubmit={handleAskQuestion} className="flex-1 overflow-y-auto p-6 space-y-5">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                                            Select Topic <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={selectedSubjectId}
                                                onChange={(e) => setSelectedSubjectId(Number(e.target.value))}
                                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900/30 focus:border-primary-400 dark:focus:border-primary-500 transition-all outline-none appearance-none font-medium"
                                                required
                                            >
                                                <option value="" disabled>Choose a subject...</option>
                                                {subjects.map(s => (
                                                    <option key={s.id} value={s.id}>{s.title}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4 pointer-events-none" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                                            Question Title <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={newTitle}
                                            onChange={(e) => setNewTitle(e.target.value)}
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900/30 focus:border-primary-400 dark:focus:border-primary-500 transition-all outline-none font-medium placeholder:font-normal placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                            placeholder="e.g., How do I implement authentication?"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                                            Details <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <textarea
                                                value={newQuestion}
                                                onChange={(e) => setNewQuestion(e.target.value)}
                                                rows={8}
                                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900/30 focus:border-primary-400 dark:focus:border-primary-500 transition-all outline-none resize-none font-medium placeholder:font-normal placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                                placeholder="Describe your question in detail..."
                                                required
                                            />
                                        </div>
                                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 text-right">Markdown is supported</p>
                                    </div>
                                </form>

                                <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 flex justify-end gap-3 sticky bottom-0">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() => setIsModalOpen(false)}
                                        className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleAskQuestion}
                                        isLoading={isSubmitting}
                                        disabled={isSubmitting}
                                        className="min-w-[120px]"
                                    >
                                        Post Question
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-4">
                        {(activeFilter === 'all' ? questions : questions.filter(q => q.subject_id === activeFilter)).length === 0 ? (
                            <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 transition-colors duration-300">
                                <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <MessageSquare className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No questions found</h3>
                                <p className="text-gray-500 dark:text-gray-400 mt-2">
                                    {activeFilter === 'all' ? 'Be the first to ask a question!' : 'No questions for this subject yet.'}
                                </p>
                            </div>
                        ) : (
                            (activeFilter === 'all' ? questions : questions.filter(q => q.subject_id === activeFilter)).map((question) => (
                                <div key={question.id} className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 transition-colors duration-300">
                                    <div className="flex gap-4">
                                        <div className="flex-shrink-0 flex flex-col items-center gap-1 text-gray-500 dark:text-gray-400">
                                            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                                {question.user?.photo ? (
                                                    <img src={getImageUrl(question.user.photo)} className="w-full h-full rounded-full object-cover" />
                                                ) : (
                                                    <span className="font-bold text-gray-500 dark:text-gray-400">
                                                        {question.user?.full_name?.charAt(0) || 'U'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{question.title}</h3>
                                                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                        <span className="font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-2 py-0.5 rounded text-xs">
                                                            {getSubjectName(question.subject_id)}
                                                        </span>
                                                        <span>•</span>
                                                        <span>{question.user?.full_name || 'Anonymous'}</span>
                                                        <span>•</span>
                                                        <span>{new Date(question.created_at).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                                {/* Expand Toggle */}
                                                <button
                                                    onClick={() => toggleExpand(question.id)}
                                                    className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-sm bg-gray-50 dark:bg-gray-800 px-3 py-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                                >
                                                    <MessageCircle className="w-4 h-4" />
                                                    <span>{question.answers.length} answers</span>
                                                    {expandedQuestions.includes(question.id) ? (
                                                        <ChevronUp className="w-4 h-4 ml-1" />
                                                    ) : (
                                                        <ChevronDown className="w-4 h-4 ml-1" />
                                                    )}
                                                </button>
                                            </div>
                                            <p className="text-gray-600 dark:text-gray-300 mt-3 whitespace-pre-wrap">{question.question_text}</p>

                                            {/* Action Buttons */}
                                            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                                                <button className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                                                    <ThumbsUp className="w-4 h-4" />
                                                    <span>Upvote ({question.upvotes})</span>
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setReplyingTo(replyingTo === question.id ? null : question.id);
                                                        // If trying to reply, also expand
                                                        if (replyingTo !== question.id && !expandedQuestions.includes(question.id)) {
                                                            toggleExpand(question.id);
                                                        }
                                                    }}
                                                    className={`flex items-center gap-2 text-sm transition-colors ${replyingTo === question.id ? 'text-primary-600 dark:text-primary-400 font-medium' : 'text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400'
                                                        }`}
                                                >
                                                    <MessageCircle className="w-4 h-4" />
                                                    <span>Reply</span>
                                                </button>
                                            </div>

                                            {/* Expanded Answers Section */}
                                            {expandedQuestions.includes(question.id) && (
                                                <div className="mt-6 space-y-4 pl-4 border-l-2 border-gray-100 dark:border-gray-800">
                                                    {question.answers.length === 0 ? (
                                                        <p className="text-sm text-gray-500 dark:text-gray-400 italic">No answers yet.</p>
                                                    ) : (
                                                        question.answers.map(answer => (
                                                            <div key={answer.id} className={`p-3 rounded-lg ${answer.is_instructor_answer ? 'bg-primary-50 dark:bg-primary-900/30 border border-primary-100 dark:border-primary-800' : 'bg-gray-50 dark:bg-gray-800'}`}>
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">{answer.user.full_name}</span>
                                                                        {answer.is_instructor_answer && (
                                                                            <span className="text-[10px] font-bold text-primary-700 dark:text-primary-400 bg-primary-200 dark:bg-primary-900/50 px-1.5 py-0.5 rounded-full uppercase">Instructor</span>
                                                                        )}
                                                                    </div>
                                                                    <span className="text-xs text-gray-500 dark:text-gray-400">{new Date(answer.created_at).toLocaleDateString()}</span>
                                                                </div>
                                                                <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap">{answer.answer_text}</p>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            )}

                                            {/* Reply Form */}
                                            {replyingTo === question.id && (
                                                <div className="mt-4 pl-4 border-l-2 border-primary-200 dark:border-primary-800 animate-in fade-in slide-in-from-top-2">
                                                    <div className="flex gap-2 bg-gray-50 dark:bg-gray-800 p-2 rounded-xl border border-gray-200 dark:border-gray-700 items-center">
                                                        <input
                                                            type="text"
                                                            value={replyText}
                                                            onChange={(e) => setReplyText(e.target.value)}
                                                            placeholder="Write your reply..."
                                                            className="flex-1 bg-transparent border-none text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-0 focus:outline-none px-2"
                                                            autoFocus
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                                    e.preventDefault();
                                                                    handlePostReply(question.id);
                                                                }
                                                            }}
                                                        />
                                                        <Button size="sm" onClick={() => handlePostReply(question.id)} disabled={isReplying} className="rounded-lg h-8 w-8 p-0 flex items-center justify-center">
                                                            <Send className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
