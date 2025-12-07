import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { qaService } from '../../services/qa.service';
import { subjectService } from '../../services/subject.service';
import { courseService } from '../../services/course.service';
import type { QAQuestion, QuestionCreate } from '../../types/qa';
import type { Subject } from '../../types/enrollment';
import type { Course } from '../../types/course';
import { ArrowLeft, Plus, MessageSquare, CheckCircle, User, Clock, Send, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

export const CourseQAPage = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [course, setCourse] = useState<Course | null>(null);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
    const [questions, setQuestions] = useState<QAQuestion[]>([]);
    const [showAskForm, setShowAskForm] = useState(false);
    const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);

    // Ask question form
    const [newQuestion, setNewQuestion] = useState<QuestionCreate>({
        subject_id: 0,
        title: '',
        question_text: '',
    });

    // Answer form
    const [answerText, setAnswerText] = useState<{ [key: number]: string }>({});

    useEffect(() => {
        if (courseId) {
            fetchData();
        }
    }, [courseId]);

    useEffect(() => {
        if (selectedSubject) {
            fetchQuestions();
        }
    }, [selectedSubject]);

    const fetchData = async () => {
        try {
            const [courseData, subjectsData] = await Promise.all([
                courseService.getCourse(Number(courseId)),
                subjectService.getCourseSubjects(Number(courseId))
            ]);
            setCourse(courseData);
            setSubjects(subjectsData);
            if (subjectsData.length > 0) {
                setSelectedSubject(subjectsData[0].id);
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
            toast.error('Failed to load course data');
        } finally {
            setLoading(false);
        }
    };

    const fetchQuestions = async () => {
        if (!selectedSubject) return;
        try {
            const data = await qaService.getSubjectQuestions(selectedSubject);
            setQuestions(data);
        } catch (error) {
            console.error('Failed to fetch questions:', error);
        }
    };

    const handleAskQuestion = async () => {
        if (!newQuestion.title.trim() || !newQuestion.question_text.trim()) {
            toast.error('Please fill in all fields');
            return;
        }

        try {
            const created = await qaService.askQuestion({
                ...newQuestion,
                subject_id: selectedSubject!,
            });
            setQuestions([created, ...questions]);
            setNewQuestion({ subject_id: 0, title: '', question_text: '' });
            setShowAskForm(false);
            toast.success('Question posted successfully');
        } catch (error) {
            console.error('Failed to ask question:', error);
            toast.error('Failed to post question');
        }
    };

    const handleAnswerQuestion = async (questionId: number) => {
        const text = answerText[questionId];
        if (!text?.trim()) {
            toast.error('Please enter an answer');
            return;
        }

        try {
            const answer = await qaService.answerQuestion({
                question_id: questionId,
                answer_text: text,
            });

            // Update questions with new answer
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
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (!course) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-500">Course not found</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/community')}
                        className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Community
                    </button>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
                            <p className="mt-2 text-gray-600">Ask questions and get help from the community.</p>
                        </div>
                        <button
                            onClick={() => setShowAskForm(!showAskForm)}
                            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Ask Question
                        </button>
                    </div>
                </div>

                {/* Subject Tabs */}
                <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                    <div className="flex items-center gap-2 overflow-x-auto">
                        {subjects.map((subject) => (
                            <button
                                key={subject.id}
                                onClick={() => setSelectedSubject(subject.id)}
                                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${selectedSubject === subject.id
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {subject.title}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Ask Question Form */}
                {showAskForm && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Ask a Question</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Title *
                                </label>
                                <input
                                    type="text"
                                    value={newQuestion.title}
                                    onChange={(e) => setNewQuestion({ ...newQuestion, title: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    placeholder="What's your question about?"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Question *
                                </label>
                                <textarea
                                    value={newQuestion.question_text}
                                    onChange={(e) => setNewQuestion({ ...newQuestion, question_text: e.target.value })}
                                    rows={4}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    placeholder="Describe your question in detail..."
                                />
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleAskQuestion}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                >
                                    Post Question
                                </button>
                                <button
                                    onClick={() => setShowAskForm(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Questions List */}
                <div className="space-y-4">
                    {questions.length > 0 ? (
                        questions.map((question) => (
                            <div key={question.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                {/* Question Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="text-lg font-bold text-gray-900">{question.title}</h3>
                                            {question.is_resolved && (
                                                <CheckCircle className="w-5 h-5 text-green-600" />
                                            )}
                                        </div>
                                        <p className="text-gray-700 mb-3">{question.question_text}</p>
                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <div className="flex items-center gap-1">
                                                <User className="w-4 h-4" />
                                                <span>{question.user?.full_name || 'Anonymous'}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                <span>{formatDistanceToNow(new Date(question.created_at), { addSuffix: true })}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <MessageSquare className="w-4 h-4" />
                                                <span>{question.answers?.length || 0} answers</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Toggle Answers */}
                                <button
                                    onClick={() => setExpandedQuestion(expandedQuestion === question.id ? null : question.id)}
                                    className="text-indigo-600 hover:text-indigo-700 font-medium text-sm mb-4"
                                >
                                    {expandedQuestion === question.id ? 'Hide' : 'Show'} Answers ({question.answers?.length || 0})
                                </button>

                                {/* Answers */}
                                {expandedQuestion === question.id && (
                                    <div className="border-t border-gray-200 pt-4 space-y-4">
                                        {/* Existing Answers */}
                                        {question.answers && question.answers.length > 0 && (
                                            <div className="space-y-3 mb-4">
                                                {question.answers.map((answer) => (
                                                    <div key={answer.id} className="bg-gray-50 rounded-lg p-4">
                                                        <p className="text-gray-800 mb-2">{answer.answer_text}</p>
                                                        <div className="flex items-center gap-4 text-xs text-gray-500">
                                                            <div className="flex items-center gap-1">
                                                                <User className="w-3 h-3" />
                                                                <span>{answer.user?.full_name || 'Anonymous'}</span>
                                                                {answer.is_instructor_answer && (
                                                                    <span className="ml-1 px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold">
                                                                        Instructor
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <Clock className="w-3 h-3" />
                                                                <span>{formatDistanceToNow(new Date(answer.created_at), { addSuffix: true })}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Answer Form */}
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={answerText[question.id] || ''}
                                                onChange={(e) => setAnswerText({ ...answerText, [question.id]: e.target.value })}
                                                onKeyPress={(e) => e.key === 'Enter' && handleAnswerQuestion(question.id)}
                                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                placeholder="Write your answer..."
                                            />
                                            <button
                                                onClick={() => handleAnswerQuestion(question.id)}
                                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                            >
                                                <Send className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                            <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No questions yet</h3>
                            <p className="text-gray-500 mb-4">Be the first to ask a question in this subject!</p>
                            <button
                                onClick={() => setShowAskForm(true)}
                                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Ask Question
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
