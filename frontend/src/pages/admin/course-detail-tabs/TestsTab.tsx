import { useState, useEffect } from 'react';
import { BookOpen, CheckCircle, Clock, FileText, Plus, AlertCircle, Calendar, Edit, Trash2, X } from 'lucide-react';
import { testService } from '../../../services/test.service';
import { subjectService } from '../../../services/subject.service';
import toast from 'react-hot-toast';
import { DeleteConfirmationModal } from '../../../components/modals/DeleteConfirmationModal';
import { format } from 'date-fns';

interface TestsTabProps {
    courseData: any;
}

export const TestsTab = ({ courseData }: TestsTabProps) => {
    const [tests, setTests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; testId: number | null; title: string }>({
        isOpen: false,
        testId: null,
        title: ''
    });
    const [deleting, setDeleting] = useState(false);

    // Test Modal State
    const [testModal, setTestModal] = useState({
        isOpen: false,
        isEditing: false,
        id: null as number | null,
        title: '',
        description: '',
        subjectId: '' as string | number,
        duration_minutes: 60,
        passing_marks: 40,
        total_marks: 100,
        is_active: true
    });
    const [saving, setSaving] = useState(false);
    const [subjects, setSubjects] = useState<any[]>([]);

    useEffect(() => {
        if (courseData?.course?.id) {
            fetchTests();
            fetchSubjects();
        }
    }, [courseData]);

    const fetchSubjects = async () => {
        try {
            const data = await subjectService.getCourseSubjects(courseData.course.id);
            setSubjects(data);
        } catch (error) {
            console.error('Failed to fetch subjects:', error);
        }
    };

    const fetchTests = async () => {
        try {
            const data = await testService.getCourseTests(courseData.course.id);
            setTests(data);
        } catch (error) {
            console.error('Failed to fetch tests:', error);
            // toast.error('Failed to load tests');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteModal.testId) return;
        setDeleting(true);
        try {
            await testService.deleteTest(deleteModal.testId);
            setTests(tests.filter(t => t.id !== deleteModal.testId));
            toast.success('Test deleted successfully');
            setDeleteModal({ isOpen: false, testId: null, title: '' });
        } catch (error) {
            console.error('Failed to delete test:', error);
            toast.error('Failed to delete test');
        } finally {
            setDeleting(false);
        }
    };

    const handleSaveTest = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!testModal.title) return;

        setSaving(true);
        try {
            const payload: any = {
                title: testModal.title,
                description: testModal.description,
                subject_id: testModal.subjectId ? Number(testModal.subjectId) : undefined,
                classroom_id: undefined,
                duration_minutes: Number(testModal.duration_minutes),
                total_marks: Number(testModal.total_marks),
                passing_marks: Number(testModal.passing_marks),
                is_active: testModal.is_active,
                questions: [] // Initialize with empty questions for now
            };

            if (testModal.isEditing && testModal.id) {
                // For update, we might not want to overwrite questions if the API expects full object.
                // Assuming updateTest handles partial updates or we need to fetch existing questions.
                // For now, let's assume partial update or that we are just updating metadata.
                delete payload.questions;
                await testService.updateTest(testModal.id, payload);
                toast.success('Test updated successfully');
            } else {
                await testService.createTest(payload);
                toast.success('Test created successfully');
            }

            fetchTests();
            setTestModal({
                isOpen: false,
                isEditing: false,
                id: null,
                title: '',
                description: '',
                subjectId: '',
                duration_minutes: 60,
                passing_marks: 40,
                total_marks: 100,
                is_active: true
            });
        } catch (error) {
            console.error('Failed to save test:', error);
            toast.error(testModal.isEditing ? 'Failed to update test' : 'Failed to create test');
        } finally {
            setSaving(false);
        }
    };

    const openCreateModal = () => {
        setTestModal({
            isOpen: true,
            isEditing: false,
            id: null,
            title: '',
            description: '',
            subjectId: '',
            duration_minutes: 60,
            passing_marks: 40,
            total_marks: 100,
            is_active: true
        });
    };

    const openEditModal = (t: any) => {
        setTestModal({
            isOpen: true,
            isEditing: true,
            id: t.id,
            title: t.title,
            description: t.description || '',
            subjectId: t.subject_id || '',
            duration_minutes: t.duration_minutes,
            passing_marks: t.passing_marks,
            total_marks: t.total_marks,
            is_active: t.is_active
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    const activeTests = tests.filter(t => t.is_active).length;
    const totalQuestions = tests.reduce((acc, t) => acc + (t.questions?.length || 0), 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl shadow-xl p-6 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold mb-2">Course Tests</h2>
                        <p className="text-purple-100">Manage quizzes, exams, and assessments</p>
                    </div>
                    <div className="text-right">
                        <div className="text-4xl font-bold">{tests.length}</div>
                        <div className="text-purple-100">Total Tests</div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-50 rounded-lg">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900">{activeTests}</div>
                            <div className="text-sm text-gray-600">Active Tests</div>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-50 rounded-lg">
                            <BookOpen className="w-8 h-8 text-purple-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900">{totalQuestions}</div>
                            <div className="text-sm text-gray-600">Total Questions</div>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-orange-50 rounded-lg">
                            <Clock className="w-8 h-8 text-orange-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900">
                                {tests.length > 0 ? Math.round(tests.reduce((acc, t) => acc + (t.duration_minutes || 0), 0) / tests.length) : 0}m
                            </div>
                            <div className="text-sm text-gray-600">Avg Duration</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tests List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-900">All Tests</h3>
                    <button
                        onClick={openCreateModal}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Create Test
                    </button>
                </div>

                {tests.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                        <p>No tests found for this course</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {tests.map((test) => (
                            <div
                                key={test.id}
                                className="p-6 hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4 flex-1">
                                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 text-purple-600">
                                            <FileText className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-1">
                                                <h4 className="text-lg font-bold text-gray-900">
                                                    {test.title}
                                                </h4>
                                                {!test.is_active && (
                                                    <span className="px-2 py-0.5 text-xs font-medium rounded-full border text-gray-600 bg-gray-50 border-gray-100">
                                                        INACTIVE
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-gray-600 mb-3 line-clamp-2">
                                                {test.description || 'No description provided'}
                                            </p>
                                            <div className="flex items-center gap-6 text-sm text-gray-500">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4" />
                                                    <span>{test.duration_minutes} mins</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <AlertCircle className="w-4 h-4" />
                                                    <span>{test.questions?.length || 0} questions</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>Created {format(new Date(test.created_at), 'MMM d, yyyy')}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => openEditModal(test)}
                                            className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                            title="Edit Test"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => setDeleteModal({ isOpen: true, testId: test.id, title: test.title })}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete Test"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <DeleteConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, testId: null, title: '' })}
                onConfirm={handleDelete}
                title="Delete Test"
                message="Are you sure you want to delete this test? All questions and student submissions will be permanently deleted."
                itemName={deleteModal.title}
                loading={deleting}
            />

            {/* Test Modal */}
            {testModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-900">
                                {testModal.isEditing ? 'Edit Test' : 'Create New Test'}
                            </h3>
                            <button
                                onClick={() => setTestModal({ ...testModal, isOpen: false })}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSaveTest}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Test Title <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={testModal.title}
                                        onChange={(e) => setTestModal({ ...testModal, title: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="e.g. Mid-term Exam"
                                        required
                                    />
                                </div>

                                {subjects.length > 0 && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Subject (Optional)
                                        </label>
                                        <select
                                            value={testModal.subjectId}
                                            onChange={(e) => setTestModal({ ...testModal, subjectId: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        >
                                            <option value="">Select a subject</option>
                                            {subjects.map((s) => (
                                                <option key={s.id} value={s.id}>{s.title}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        value={testModal.description}
                                        onChange={(e) => setTestModal({ ...testModal, description: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="Brief description..."
                                        rows={3}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Duration (mins)
                                        </label>
                                        <input
                                            type="number"
                                            value={testModal.duration_minutes}
                                            onChange={(e) => setTestModal({ ...testModal, duration_minutes: Number(e.target.value) })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            min="1"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Total Marks
                                        </label>
                                        <input
                                            type="number"
                                            value={testModal.total_marks}
                                            onChange={(e) => setTestModal({ ...testModal, total_marks: Number(e.target.value) })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            min="0"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Passing Marks
                                        </label>
                                        <input
                                            type="number"
                                            value={testModal.passing_marks}
                                            onChange={(e) => setTestModal({ ...testModal, passing_marks: Number(e.target.value) })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            min="0"
                                        />
                                    </div>
                                    <div className="flex items-center pt-6">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={testModal.is_active}
                                                onChange={(e) => setTestModal({ ...testModal, is_active: e.target.checked })}
                                                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                            />
                                            <span className="text-sm font-medium text-gray-700">Active</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setTestModal({ ...testModal, isOpen: false })}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving || !testModal.title}
                                    className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {saving ? 'Saving...' : (testModal.isEditing ? 'Save Changes' : 'Create Test')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
