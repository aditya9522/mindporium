import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { testService } from '../../services/test.service';
import type { Test } from '../../types/test';
import { Plus, FileText, Users, Clock, CheckCircle, Loader2, Eye, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { DeleteConfirmationModal } from '../../components/modals/DeleteConfirmationModal';

export const TestsManagementPage = () => {
    const [tests, setTests] = useState<Test[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; testId: number | null }>({
        isOpen: false,
        testId: null
    });
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        fetchTests();
    }, []);

    const fetchTests = async () => {
        try {
            setLoading(true);
            const data = await testService.getInstructorTests();
            setTests(data);
        } catch (error) {
            console.error('Failed to fetch tests:', error);
            toast.error('Failed to load tests');
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
            setDeleteModal({ isOpen: false, testId: null });
        } catch (error) {
            console.error('Failed to delete test:', error);
            toast.error('Failed to delete test');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Tests Management</h1>
                        <p className="mt-2 text-gray-600">Create and manage tests for your courses</p>
                    </div>
                    <Link
                        to="/instructor/tests/create"
                        className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-sm"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Create Test
                    </Link>
                </div>

                {/* Tests Grid */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                    </div>
                ) : tests.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No tests yet</h3>
                        <p className="text-gray-500 mb-6">Create your first test to assess student learning</p>
                        <Link
                            to="/instructor/tests/create"
                            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-sm"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Create Test
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tests.map((test) => (
                            <div key={test.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-gray-900 mb-1">{test.title}</h3>
                                        {test.description && (
                                            <p className="text-sm text-gray-600 line-clamp-2">{test.description}</p>
                                        )}
                                    </div>
                                    {test.status === 'published' ? (
                                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                            Published
                                        </span>
                                    ) : test.status === 'archived' ? (
                                        <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs font-medium rounded-full">
                                            Archived
                                        </span>
                                    ) : (
                                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                                            Draft
                                        </span>
                                    )}
                                    <div className="flex gap-2">
                                        <Link
                                            to={`/instructor/tests/${test.id}/edit`}
                                            className="p-1 text-gray-400 hover:text-indigo-600 transition-colors"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </Link>
                                        <button
                                            onClick={() => setDeleteModal({ isOpen: true, testId: test.id })}
                                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center text-sm text-gray-600">
                                        <FileText className="w-4 h-4 mr-2 text-indigo-500" />
                                        <span className="font-medium">{test.questions.length}</span>
                                        <span className="ml-1">Questions</span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Clock className="w-4 h-4 mr-2 text-amber-500" />
                                        <span className="font-medium">{test.duration_minutes}</span>
                                        <span className="ml-1">minutes</span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <CheckCircle className="w-4 h-4 mr-2 text-purple-500" />
                                        <span className="font-medium">{test.total_marks}</span>
                                        <span className="ml-1">marks (Pass: {test.passing_marks})</span>
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-4 border-t border-gray-100">
                                    <Link
                                        to={`/test/${test.id}/submissions`}
                                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-medium"
                                    >
                                        <Users className="w-4 h-4" />
                                        Submissions
                                    </Link>
                                    <Link
                                        to={`/test/${test.id}/take`}
                                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                                    >
                                        <Eye className="w-4 h-4" />
                                        Preview
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <DeleteConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, testId: null })}
                onConfirm={handleDelete}
                title="Delete Test"
                message="Are you sure you want to delete this test? This action cannot be undone."
                loading={deleting}
            />
        </div>
    );
};
