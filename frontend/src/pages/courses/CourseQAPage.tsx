import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2, MessageSquare, ThumbsUp, MessageCircle, Plus, ChevronDown, ChevronUp, Send } from 'lucide-react';
import api from '../../lib/axios';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';
import { getImageUrl } from '../../lib/utils';

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
    const [isAsking, setIsAsking] = useState(false);

    // Form State
    const [newTitle, setNewTitle] = useState('');
    const [newQuestion, setNewQuestion] = useState('');
    const [selectedSubjectId, setSelectedSubjectId] = useState<number | ''>('');
    const [activeFilter, setActiveFilter] = useState<number | 'all'>('all');

    // Reply State
    const [expandedQuestions, setExpandedQuestions] = useState<number[]>([]);
    const [replyingTo, setReplyingTo] = useState<number | null>(null);
    const [replyText, setReplyText] = useState('');

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
        try {
            await api.post('/qa/questions', {
                title: newTitle,
                question_text: newQuestion,
                subject_id: selectedSubjectId
            });
            toast.success('Question posted successfully!');
            setIsAsking(false);
            setNewTitle('');
            setNewQuestion('');
            loadData();
        } catch (error) {
            toast.error('Failed to post question');
        }
    };

    const toggleExpand = (qId: number) => {
        setExpandedQuestions(prev =>
            prev.includes(qId) ? prev.filter(id => id !== qId) : [...prev, qId]
        );
    };

    const handlePostReply = async (questionId: number) => {
        if (!replyText.trim()) return;
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
        }
    };

    const getSubjectName = (subjectId: number) => {
        return subjects.find(s => s.id === subjectId)?.title || 'Unknown Subject';
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="py-8 max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Course Community</h1>
                    <p className="text-gray-500 mt-1">Ask questions and discuss topics with your peers</p>
                </div>
                <Button onClick={() => setIsAsking(!isAsking)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Ask Question
                </Button>
            </div>

            {/* Subject Filters */}
            <div className="flex overflow-x-auto pb-2 gap-2 mb-6 no-scrollbar">
                <button
                    onClick={() => setActiveFilter('all')}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeFilter === 'all'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                        }`}
                >
                    All Subjects
                </button>
                {subjects.map(subject => (
                    <button
                        key={subject.id}
                        onClick={() => setActiveFilter(subject.id)}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeFilter === subject.id
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                            }`}
                    >
                        {subject.title}
                    </button>
                ))}
            </div>

            {isAsking && (
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm animate-in fade-in slide-in-from-top-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Ask a Question</h3>
                    <form onSubmit={handleAskQuestion} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                            <div className="relative">
                                <select
                                    value={selectedSubjectId}
                                    onChange={(e) => setSelectedSubjectId(Number(e.target.value))}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all outline-none appearance-none"
                                    required
                                >
                                    <option value="" disabled>Select a subject</option>
                                    {subjects.map(s => (
                                        <option key={s.id} value={s.id}>{s.title}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                            <input
                                type="text"
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all outline-none"
                                placeholder="What is your question about?"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Details</label>
                            <textarea
                                value={newQuestion}
                                onChange={(e) => setNewQuestion(e.target.value)}
                                rows={4}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all outline-none resize-none"
                                placeholder="Describe your question in detail..."
                                required
                            />
                        </div>
                        <div className="flex justify-end gap-3">
                            <Button type="button" variant="ghost" onClick={() => setIsAsking(false)}>Cancel</Button>
                            <Button type="submit">Post Question</Button>
                        </div>
                    </form>
                </div>
            )}

            <div className="space-y-4">
                {(activeFilter === 'all' ? questions : questions.filter(q => q.subject_id === activeFilter)).length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                        <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">No questions found</h3>
                        <p className="text-gray-500 mt-2">
                            {activeFilter === 'all' ? 'Be the first to ask a question!' : 'No questions for this subject yet.'}
                        </p>
                    </div>
                ) : (
                    (activeFilter === 'all' ? questions : questions.filter(q => q.subject_id === activeFilter)).map((question) => (
                        <div key={question.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 flex flex-col items-center gap-1 text-gray-500">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                                        {question.user?.photo ? (
                                            <img src={getImageUrl(question.user.photo)} className="w-full h-full rounded-full object-cover" />
                                        ) : (
                                            <span className="font-bold text-gray-500">
                                                {question.user?.full_name?.charAt(0) || 'U'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900">{question.title}</h3>
                                            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                                <span className="font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded text-xs">
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
                                            className="flex items-center gap-1 text-gray-500 text-sm bg-gray-50 px-3 py-1 rounded-full hover:bg-gray-100 transition-colors"
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
                                    <p className="text-gray-600 mt-3 whitespace-pre-wrap">{question.question_text}</p>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
                                        <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 transition-colors">
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
                                            className={`flex items-center gap-2 text-sm transition-colors ${replyingTo === question.id ? 'text-indigo-600 font-medium' : 'text-gray-500 hover:text-indigo-600'
                                                }`}
                                        >
                                            <MessageCircle className="w-4 h-4" />
                                            <span>Reply</span>
                                        </button>
                                    </div>

                                    {/* Expanded Answers Section */}
                                    {expandedQuestions.includes(question.id) && (
                                        <div className="mt-6 space-y-4 pl-4 border-l-2 border-gray-100">
                                            {question.answers.length === 0 ? (
                                                <p className="text-sm text-gray-500 italic">No answers yet.</p>
                                            ) : (
                                                question.answers.map(answer => (
                                                    <div key={answer.id} className={`p-3 rounded-lg ${answer.is_instructor_answer ? 'bg-indigo-50 border border-indigo-100' : 'bg-gray-50'}`}>
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-semibold text-sm text-gray-900">{answer.user.full_name}</span>
                                                                {answer.is_instructor_answer && (
                                                                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-200 px-1.5 py-0.5 rounded-full uppercase">Instructor</span>
                                                                )}
                                                            </div>
                                                            <span className="text-xs text-gray-500">{new Date(answer.created_at).toLocaleDateString()}</span>
                                                        </div>
                                                        <p className="text-gray-700 text-sm whitespace-pre-wrap">{answer.answer_text}</p>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    )}

                                    {/* Reply Form */}
                                    {replyingTo === question.id && (
                                        <div className="mt-4 pl-4 border-l-2 border-indigo-200 animate-in fade-in slide-in-from-top-2">
                                            <div className="flex gap-2 bg-gray-50 p-2 rounded-xl border border-gray-200 items-center">
                                                <input
                                                    type="text"
                                                    value={replyText}
                                                    onChange={(e) => setReplyText(e.target.value)}
                                                    placeholder="Write your reply..."
                                                    className="flex-1 bg-transparent border-none text-sm focus:ring-0 focus:outline-none px-2"
                                                    autoFocus
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' && !e.shiftKey) {
                                                            e.preventDefault();
                                                            handlePostReply(question.id);
                                                        }
                                                    }}
                                                />
                                                <Button size="sm" onClick={() => handlePostReply(question.id)} className="rounded-lg h-8 w-8 p-0 flex items-center justify-center">
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
    );
};
