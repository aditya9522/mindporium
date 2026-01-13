import { useState, useEffect } from 'react';
import { FolderOpen, Plus, Edit, Trash2, BookOpen, GraduationCap, FileText, X, Loader2 } from 'lucide-react';
import api from '../../../lib/axios';
import { subjectService } from '../../../services/subject.service';
import toast from 'react-hot-toast';
import { DeleteConfirmationModal } from '../../../components/common/DeleteConfirmationModal';

interface SubjectsTabProps {
    courseData: any;
}

export const SubjectsTab = ({ courseData }: SubjectsTabProps) => {
    const [subjects, setSubjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; subjectId: number | null; subjectTitle: string }>({
        isOpen: false,
        subjectId: null,
        subjectTitle: ''
    });
    const [deleting, setDeleting] = useState(false);

    // Subject Modal State
    const [subjectModal, setSubjectModal] = useState({ isOpen: false, isEditing: false, id: null as number | null, title: '', description: '' });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (courseData?.course?.id) {
            fetchSubjects();
        }
    }, [courseData]);

    const fetchSubjects = async () => {
        try {
            const response = await api.get(`/subjects/course/${courseData.course.id}`);
            setSubjects(response.data);
        } catch (error) {
            console.error('Failed to fetch subjects:', error);
            toast.error('Failed to load subjects');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteModal.subjectId) return;
        setDeleting(true);
        try {
            await api.delete(`/subjects/${deleteModal.subjectId}`);
            setSubjects(subjects.filter(s => s.id !== deleteModal.subjectId));
            toast.success('Subject deleted successfully');
            setDeleteModal({ isOpen: false, subjectId: null, subjectTitle: '' });
        } catch (error) {
            console.error('Failed to delete subject:', error);
            toast.error('Failed to delete subject');
        } finally {
            setDeleting(false);
        }
    };

    const handleSaveSubject = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!subjectModal.title.trim()) return;

        setSaving(true);
        try {
            if (subjectModal.isEditing && subjectModal.id) {
                const updatedSubject = await subjectService.updateSubject(subjectModal.id, {
                    title: subjectModal.title,
                    description: subjectModal.description
                });
                setSubjects(subjects.map(s => s.id === subjectModal.id ? updatedSubject : s));
                toast.success('Subject updated successfully');
            } else {
                const newSubject = await subjectService.createSubject({
                    title: subjectModal.title,
                    description: subjectModal.description,
                    course_id: courseData.course.id,
                    order_index: subjects.length
                });
                setSubjects([...subjects, newSubject]);
                toast.success('Subject created successfully');
            }
            setSubjectModal({ isOpen: false, isEditing: false, id: null, title: '', description: '' });
        } catch (error) {
            console.error('Failed to save subject:', error);
            toast.error(subjectModal.isEditing ? 'Failed to update subject' : 'Failed to create subject');
        } finally {
            setSaving(false);
        }
    };

    const openCreateModal = () => {
        setSubjectModal({ isOpen: true, isEditing: false, id: null, title: '', description: '' });
    };

    const openEditModal = (subject: any) => {
        setSubjectModal({
            isOpen: true,
            isEditing: true,
            id: subject.id,
            title: subject.title,
            description: subject.description || ''
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 text-primary-600 dark:text-primary-400 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-xl p-6 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold mb-2">Course Subjects</h2>
                        <p className="text-indigo-100">Manage all subjects and topics for this course</p>
                    </div>
                    <div className="text-right">
                        <div className="text-4xl font-bold">{subjects.length}</div>
                        <div className="text-indigo-100">Total Subjects</div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 transition-colors duration-300">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary-50 dark:bg-primary-900/30 rounded-lg">
                            <FolderOpen className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{subjects.length}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Total Subjects</div>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 transition-colors duration-300">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                            <GraduationCap className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                {subjects.reduce((sum, s) => sum + (s.total_classes || 0), 0)}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Total Classes</div>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 transition-colors duration-300">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
                            <FileText className="w-8 h-8 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">-</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Resources</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Subjects List */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden transition-colors duration-300">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">All Subjects</h3>
                    <button
                        onClick={openCreateModal}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Add Subject
                    </button>
                </div>

                {subjects.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        <FolderOpen className="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-gray-500" />
                        <p>No subjects found for this course</p>
                        <button
                            onClick={openCreateModal}
                            className="mt-4 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
                        >
                            Create your first subject
                        </button>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {subjects.map((subject, index) => (
                            <div
                                key={subject.id}
                                className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4 flex-1">
                                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-lg">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                                                {subject.title}
                                            </h4>
                                            {subject.description && (
                                                <p className="text-gray-600 dark:text-gray-400 mb-3">
                                                    {subject.description}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                                <div className="flex items-center gap-1">
                                                    <GraduationCap className="w-4 h-4" />
                                                    <span>{subject.total_classes || 0} classes</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <FileText className="w-4 h-4" />
                                                    <span>0 resources</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <BookOpen className="w-4 h-4" />
                                                    <span>0 tests</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => openEditModal(subject)}
                                            className="p-2 text-gray-400 dark:text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => setDeleteModal({ isOpen: true, subjectId: subject.id, subjectTitle: subject.title })}
                                            className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
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
                onClose={() => setDeleteModal({ isOpen: false, subjectId: null, subjectTitle: '' })}
                onConfirm={handleDelete}
                title="Delete Subject"
                message="Are you sure you want to delete this subject? All associated lessons and content will also be deleted."
                itemName={deleteModal.subjectTitle}
                loading={deleting}
            />

            {/* Subject Modal */}
            {subjectModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200 border border-gray-200 dark:border-gray-800">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                {subjectModal.isEditing ? 'Edit Subject' : 'Add New Subject'}
                            </h3>
                            <button
                                onClick={() => setSubjectModal({ ...subjectModal, isOpen: false })}
                                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSaveSubject}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Subject Title <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={subjectModal.title}
                                        onChange={(e) => setSubjectModal({ ...subjectModal, title: e.target.value })}
                                        className="w-full px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        placeholder="e.g. Introduction to React"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        value={subjectModal.description}
                                        onChange={(e) => setSubjectModal({ ...subjectModal, description: e.target.value })}
                                        className="w-full px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        placeholder="Brief description of the subject..."
                                        rows={3}
                                    />
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setSubjectModal({ ...subjectModal, isOpen: false })}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving || !subjectModal.title.trim()}
                                    className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                                >
                                    {saving ? 'Saving...' : (subjectModal.isEditing ? 'Save Changes' : 'Create Subject')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
