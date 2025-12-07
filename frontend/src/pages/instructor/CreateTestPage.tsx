import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { testService } from '../../services/test.service';
import { subjectService } from '../../services/subject.service';
import { Plus, Trash2, ArrowLeft, Loader2, Save } from 'lucide-react';
import toast from 'react-hot-toast';

interface Question {
    question_text: string;
    question_type: 'mcq' | 'short_answer' | 'essay';
    options?: string[];
    correct_answer?: string;
    marks: number;
    order_index: number;
}

export const CreateTestPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [loadingSubjects, setLoadingSubjects] = useState(true);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        subject_id: '',
        duration_minutes: 60,
        total_marks: 0,
        passing_marks: 0,
        status: 'draft' as 'draft' | 'published',
    });

    const [questions, setQuestions] = useState<Question[]>([
        {
            question_text: '',
            question_type: 'mcq',
            options: ['', '', '', ''],
            correct_answer: '',
            marks: 1,
            order_index: 0,
        },
    ]);

    useEffect(() => {
        fetchSubjects();
    }, []);

    useEffect(() => {
        // Auto-calculate total marks
        const total = questions.reduce((sum, q) => sum + q.marks, 0);
        setFormData(prev => ({ ...prev, total_marks: total }));
    }, [questions]);

    const fetchSubjects = async () => {
        try {
            setLoadingSubjects(true);
            const data = await subjectService.getMySubjects();
            setSubjects(data);
        } catch (error) {
            console.error('Failed to fetch subjects:', error);
            toast.error('Failed to load subjects');
        } finally {
            setLoadingSubjects(false);
        }
    };

    const addQuestion = () => {
        setQuestions([
            ...questions,
            {
                question_text: '',
                question_type: 'mcq',
                options: ['', '', '', ''],
                correct_answer: '',
                marks: 1,
                order_index: questions.length,
            },
        ]);
    };

    const removeQuestion = (index: number) => {
        if (questions.length === 1) {
            toast.error('Test must have at least one question');
            return;
        }
        setQuestions(questions.filter((_, i) => i !== index));
    };

    const updateQuestion = (index: number, field: keyof Question, value: any) => {
        const updated = [...questions];
        updated[index] = { ...updated[index], [field]: value };
        setQuestions(updated);
    };

    const updateOption = (qIndex: number, optIndex: number, value: string) => {
        const updated = [...questions];
        if (updated[qIndex].options) {
            updated[qIndex].options![optIndex] = value;
            setQuestions(updated);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.title.trim()) {
            toast.error('Please enter a test title');
            return;
        }
        // Subject is now optional

        if (questions.some(q => !q.question_text.trim())) {
            toast.error('All questions must have text');
            return;
        }
        if (questions.some(q => q.question_type === 'mcq' && !q.correct_answer)) {
            toast.error('All MCQ questions must have a correct answer');
            return;
        }

        try {
            setLoading(true);
            const testData = {
                ...formData,
                subject_id: formData.subject_id ? parseInt(formData.subject_id) : undefined,
                questions: questions.map((q, idx) => ({
                    question_text: q.question_text,
                    question_type: q.question_type,
                    options: q.question_type === 'mcq' ? q.options : undefined,
                    correct_answer: q.question_type === 'mcq' ? q.correct_answer : undefined,
                    marks: q.marks,
                    order_index: idx,
                })),
            };

            await testService.createTest(testData);
            toast.success('Test created successfully!');
            navigate('/instructor/tests');
        } catch (error: any) {
            console.error('Failed to create test:', error);
            toast.error(error.response?.data?.detail || 'Failed to create test');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
                <button
                    onClick={() => navigate('/instructor/tests')}
                    className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Tests
                </button>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Test</h1>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Test Title *
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    placeholder="e.g., Mid-term Examination"
                                    required
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    placeholder="Brief description of the test"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Subject (Optional)
                                </label>
                                <select
                                    value={formData.subject_id}
                                    onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    disabled={loadingSubjects}
                                >
                                    <option value="">Select a subject</option>
                                    {subjects.map((subject) => (
                                        <option key={subject.id} value={subject.id}>
                                            {subject.title} ({subject.course_title})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Duration (minutes) *
                                </label>
                                <input
                                    type="number"
                                    value={formData.duration_minutes}
                                    onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                                    min="1"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Total Marks
                                </label>
                                <input
                                    type="number"
                                    value={formData.total_marks}
                                    readOnly
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                                />
                                <p className="text-xs text-gray-500 mt-1">Auto-calculated from questions</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Passing Marks *
                                </label>
                                <input
                                    type="number"
                                    value={formData.passing_marks}
                                    onChange={(e) => setFormData({ ...formData, passing_marks: parseFloat(e.target.value) })}
                                    min="0"
                                    max={formData.total_marks}
                                    step="0.5"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Status
                                </label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                >
                                    <option value="draft">Draft</option>
                                    <option value="published">Published</option>
                                </select>
                            </div>
                        </div>

                        {/* Questions */}
                        <div className="border-t border-gray-200 pt-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-bold text-gray-900">Questions</h2>
                                <button
                                    type="button"
                                    onClick={addQuestion}
                                    className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-medium"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Question
                                </button>
                            </div>

                            <div className="space-y-6">
                                {questions.map((question, qIndex) => (
                                    <div key={qIndex} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="font-medium text-gray-900">Question {qIndex + 1}</h3>
                                            {questions.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeQuestion(qIndex)}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Question Text *
                                                </label>
                                                <textarea
                                                    value={question.question_text}
                                                    onChange={(e) => updateQuestion(qIndex, 'question_text', e.target.value)}
                                                    rows={2}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                                                    placeholder="Enter your question"
                                                    required
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Question Type
                                                    </label>
                                                    <select
                                                        value={question.question_type}
                                                        onChange={(e) => updateQuestion(qIndex, 'question_type', e.target.value)}
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                                                    >
                                                        <option value="mcq">Multiple Choice</option>
                                                        <option value="short_answer">Short Answer</option>
                                                        <option value="essay">Essay</option>
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Marks *
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={question.marks}
                                                        onChange={(e) => updateQuestion(qIndex, 'marks', parseFloat(e.target.value))}
                                                        min="0.5"
                                                        step="0.5"
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            {question.question_type === 'mcq' && (
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Options
                                                    </label>
                                                    <div className="space-y-2">
                                                        {question.options?.map((option, optIndex) => (
                                                            <div key={optIndex} className="flex items-center gap-2">
                                                                <input
                                                                    type="radio"
                                                                    name={`correct-${qIndex}`}
                                                                    checked={question.correct_answer === option}
                                                                    onChange={() => updateQuestion(qIndex, 'correct_answer', option)}
                                                                    className="w-4 h-4 text-indigo-600"
                                                                />
                                                                <input
                                                                    type="text"
                                                                    value={option}
                                                                    onChange={(e) => updateOption(qIndex, optIndex, e.target.value)}
                                                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                                                                    placeholder={`Option ${optIndex + 1}`}
                                                                    required
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-2">
                                                        Select the radio button for the correct answer
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex gap-4 pt-6 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={() => navigate('/instructor/tests')}
                                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        Create Test
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
