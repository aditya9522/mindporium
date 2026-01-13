import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { testService } from '../../services/test.service';
import { subjectService } from '../../services/subject.service';
import { courseService } from '../../services/course.service';
import { Plus, Trash2, ArrowLeft, Loader2, Save, ChevronDown, ChevronUp, CheckCircle, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

interface Question {
    id?: number;
    question_text: string;
    question_type: 'mcq' | 'short_answer' | 'essay';
    options?: string[];
    correct_answer?: string;
    marks: number;
    order_index: number;
}

export const CreateTestPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = !!id;

    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);

    // Data Sources
    const [allSubjects, setAllSubjects] = useState<any[]>([]);
    const [courses, setCourses] = useState<any[]>([]);

    // UI State
    const [selectedCourseId, setSelectedCourseId] = useState<string>('');
    const [expandedQuestions, setExpandedQuestions] = useState<{ [key: number]: boolean }>({ 0: true });

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

    const toggleQuestion = (index: number) => {
        setExpandedQuestions(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    const [searchParams] = useSearchParams();

    // Initial Data Fetch
    useEffect(() => {
        loadInitialData();
    }, []);

    // Filter subjects based on selected course
    const filteredSubjects = selectedCourseId
        ? allSubjects.filter(s => s.course_id === parseInt(selectedCourseId))
        : allSubjects;

    const loadInitialData = async () => {
        try {
            setPageLoading(true);
            const [subjectsData, coursesData] = await Promise.all([
                subjectService.getMySubjects(),
                courseService.getMyCourses()
            ]);

            setAllSubjects(subjectsData);
            setCourses(coursesData);

            // If query param exists
            const subjectIdParam = searchParams.get('subject_id');
            if (subjectIdParam) {
                setFormData(prev => ({ ...prev, subject_id: subjectIdParam }));
                // Try to find course for this subject
                const subj = subjectsData.find(s => s.id === parseInt(subjectIdParam));
                if (subj) setSelectedCourseId(subj.course_id.toString());
            }

            // If Editing
            if (id) {
                await loadTestData(parseInt(id), subjectsData);
            }

        } catch (error) {
            console.error('Failed to load data:', error);
            toast.error('Failed to load initial data');
        } finally {
            setPageLoading(false);
        }
    };

    const loadTestData = async (testId: number, currentSubjects: any[]) => {
        try {
            const test = await testService.getTest(testId);
            setFormData({
                title: test.title,
                description: test.description || '',
                subject_id: test.subject_id?.toString() || '',
                duration_minutes: test.duration_minutes,
                total_marks: test.total_marks,
                passing_marks: test.passing_marks,
                status: test.status as 'draft' | 'published',
            });

            // Map questions
            if (test.questions && test.questions.length > 0) {
                setQuestions(test.questions.map((q: any, idx: number) => ({
                    id: q.id,
                    question_text: q.question_text,
                    question_type: q.question_type,
                    options: q.options || ['', '', '', ''],
                    correct_answer: q.correct_answer || '',
                    marks: q.marks,
                    order_index: idx,
                })));
            }

            // Set Course Filter
            if (test.subject_id) {
                const subj = currentSubjects.find(s => s.id === test.subject_id);
                if (subj) {
                    setSelectedCourseId(subj.course_id.toString());
                }
            }

        } catch (error) {
            console.error('Failed to load test:', error);
            toast.error('Failed to load test details');
            navigate('/instructor/tests');
        }
    };

    const addQuestion = () => {
        const newIndex = questions.length;
        setQuestions([
            ...questions,
            {
                question_text: '',
                question_type: 'mcq',
                options: ['', '', '', ''],
                correct_answer: '',
                marks: 1,
                order_index: newIndex,
            },
        ]);
        setExpandedQuestions(prev => ({ ...prev, [newIndex]: true }));
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

    // Auto-calculate marks
    useEffect(() => {
        const total = questions.reduce((sum, q) => sum + q.marks, 0);
        setFormData(prev => ({ ...prev, total_marks: total }));
    }, [questions]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.title.trim()) {
            toast.error('Please enter a test title');
            return;
        }

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
            const payload = {
                ...formData,
                subject_id: formData.subject_id ? parseInt(formData.subject_id) : undefined,
                questions: questions.map((q, idx) => ({
                    id: q.id, // Include ID for updates
                    question_text: q.question_text,
                    question_type: q.question_type,
                    options: q.question_type === 'mcq' ? q.options : undefined,
                    correct_answer: q.question_type === 'mcq' ? q.correct_answer : undefined,
                    marks: q.marks,
                    order_index: idx,
                })),
            };

            if (isEditing && id) {
                await testService.updateTest(parseInt(id), payload);
                toast.success('Test updated successfully!');
            } else {
                await testService.createTest(payload);
                toast.success('Test created successfully!');
            }

            navigate('/instructor/tests');
        } catch (error: any) {
            console.error('Failed to save test:', error);
            toast.error(error.response?.data?.detail || 'Failed to save test');
        } finally {
            setLoading(false);
        }
    };

    if (pageLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600 dark:text-primary-400" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 transition-colors duration-300">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <button
                    onClick={() => navigate('/instructor/tests')}
                    className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Tests
                </button>

                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 mb-6 transition-colors duration-300">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                        {isEditing ? 'Edit Test' : 'Create New Test'}
                    </h1>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Test Title *
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                                    className="w-full px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    placeholder="Brief description of the test"
                                />
                            </div>

                            {/* Course & Subject Selection */}
                            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 md:col-span-2 space-y-4">
                                <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                    <Filter className="w-4 h-4" />
                                    Test Context (Optional)
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                                            Filter by Course
                                        </label>
                                        <select
                                            value={selectedCourseId}
                                            onChange={(e) => {
                                                setSelectedCourseId(e.target.value);
                                                setFormData({ ...formData, subject_id: '' }); // Reset subject
                                            }}
                                            className="w-full px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                                        >
                                            <option value="">All Courses</option>
                                            {courses.map((course) => (
                                                <option key={course.id} value={course.id}>
                                                    {course.title}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                                            Select Subject
                                        </label>
                                        <select
                                            value={formData.subject_id}
                                            onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
                                            className="w-full px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                                        >
                                            <option value="">-- General / No Subject --</option>
                                            {filteredSubjects.map((subject) => (
                                                <option key={subject.id} value={subject.id}>
                                                    {subject.title} {selectedCourseId ? '' : `(${subject.course_title})`}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
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
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg"
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Auto-calculated from questions</p>
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
                                    className="w-full px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                                    className="w-full px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                >
                                    <option value="draft">Draft</option>
                                    <option value="published">Published</option>
                                </select>
                            </div>
                        </div>

                        {/* Questions */}
                        <div className="border-t border-gray-200 pt-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Questions</h2>
                                <button
                                    type="button"
                                    onClick={addQuestion}
                                    className="flex items-center gap-2 px-4 py-2 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/20 transition-colors text-sm font-medium"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Question
                                </button>
                            </div>

                            <div className="space-y-6">
                                {questions.map((question, qIndex) => (
                                    <div key={qIndex} className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 overflow-hidden shadow-sm transition-colors duration-300">
                                        <div
                                            className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800/50 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                                            onClick={() => toggleQuestion(qIndex)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-xs font-bold">
                                                    {qIndex + 1}
                                                </span>
                                                <h3 className="font-medium text-gray-900 dark:text-gray-100">
                                                    {question.question_text ? (question.question_text.length > 50 ? question.question_text.substring(0, 50) + '...' : question.question_text) : 'New Question'}
                                                </h3>
                                                <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                                                    {question.question_type === 'mcq' ? 'MCQ' : question.question_type === 'short_answer' ? 'Short Answer' : 'Essay'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {expandedQuestions[qIndex] ? <ChevronUp className="w-4 h-4 text-gray-400 dark:text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-500" />}
                                                {questions.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            removeQuestion(qIndex);
                                                        }}
                                                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors ml-2"
                                                        title="Delete Question"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {expandedQuestions[qIndex] && (
                                            <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-4 animate-in slide-in-from-top-2 duration-200">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        Question Text *
                                                    </label>
                                                    <textarea
                                                        value={question.question_text}
                                                        onChange={(e) => updateQuestion(qIndex, 'question_text', e.target.value)}
                                                        rows={2}
                                                        className="w-full px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                                                            className="w-full px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                                                            className="w-full px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                                            required
                                                        />
                                                    </div>
                                                </div>

                                                {question.question_type === 'mcq' && (
                                                    <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Options
                                                        </label>
                                                        <div className="space-y-2">
                                                            {question.options?.map((option, optIndex) => (
                                                                <div key={optIndex} className="flex items-center gap-2">
                                                                    <input
                                                                        type="radio"
                                                                        name={`correct-${qIndex}`}
                                                                        checked={question.correct_answer === option && option !== ''}
                                                                        onChange={() => updateQuestion(qIndex, 'correct_answer', option)}
                                                                        className="w-4 h-4 text-primary-600 dark:text-primary-400 focus:ring-primary-500"
                                                                    />
                                                                    <input
                                                                        type="text"
                                                                        value={option}
                                                                        onChange={(e) => updateOption(qIndex, optIndex, e.target.value)}
                                                                        className="flex-1 px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                                                                        placeholder={`Option ${optIndex + 1}`}
                                                                        required
                                                                    />
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-1">
                                                            <CheckCircle className="w-3 h-3" /> Select the radio button for the correct answer
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                            <button
                                type="button"
                                onClick={() => navigate('/instructor/tests')}
                                className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        {isEditing ? 'Updating...' : 'Creating...'}
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        {isEditing ? 'Update Test' : 'Create Test'}
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
