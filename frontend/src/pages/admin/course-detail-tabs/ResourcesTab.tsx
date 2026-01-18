import { useState, useEffect } from 'react';
import { FileText, Video, Link as LinkIcon, Download, Plus, ExternalLink, File, Trash2, Edit, X, Loader2 } from 'lucide-react';
import { resourceService } from '../../../services/resource.service';
import { subjectService } from '../../../services/subject.service';
import toast from 'react-hot-toast';
import { DeleteConfirmationModal } from '../../../components/common/DeleteConfirmationModal';
import { format } from 'date-fns';

interface ResourcesTabProps {
    courseData: any;
}

export const ResourcesTab = ({ courseData }: ResourcesTabProps) => {
    const [resources, setResources] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; resourceId: number | null; title: string }>({
        isOpen: false,
        resourceId: null,
        title: ''
    });
    const [deleting, setDeleting] = useState(false);

    // Resource Modal State
    const [resourceModal, setResourceModal] = useState({
        isOpen: false,
        isEditing: false,
        id: null as number | null,
        title: '',
        description: '',
        resource_type: 'link',
        file_url: '',
        subjectId: '' as string | number,
        is_downloadable: false,
    });
    const [saving, setSaving] = useState(false);
    const [subjects, setSubjects] = useState<any[]>([]);

    useEffect(() => {
        if (courseData?.course?.id) {
            fetchResources();
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

    const fetchResources = async () => {
        try {
            const data = await resourceService.getCourseResources(courseData.course.id);
            setResources(data);
        } catch (error) {
            console.error('Failed to fetch resources:', error);
            // toast.error('Failed to load resources');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteModal.resourceId) return;
        setDeleting(true);
        try {
            await resourceService.deleteResource(deleteModal.resourceId);
            setResources(resources.filter(r => r.id !== deleteModal.resourceId));
            toast.success('Resource deleted successfully');
            setDeleteModal({ isOpen: false, resourceId: null, title: '' });
        } catch (error) {
            console.error('Failed to delete resource:', error);
            toast.error('Failed to delete resource');
        } finally {
            setDeleting(false);
        }
    };

    const handleSaveResource = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!resourceModal.title || !resourceModal.file_url) return;

        setSaving(true);
        try {
            const payload: any = {
                title: resourceModal.title,
                description: resourceModal.description,
                resource_type: resourceModal.resource_type as any,
                file_url: resourceModal.file_url,
                subject_id: resourceModal.subjectId ? Number(resourceModal.subjectId) : undefined,
                classroom_id: undefined, // Add logic if associated with specific classroom
                is_downloadable: resourceModal.is_downloadable,
                order_index: resources.length // Simple append
            };

            if (resourceModal.isEditing && resourceModal.id) {
                await resourceService.updateResource(resourceModal.id, payload);
                toast.success('Resource updated successfully');
            } else {
                await resourceService.createResource(payload);
                toast.success('Resource added successfully');
            }

            fetchResources();
            setResourceModal({
                isOpen: false,
                isEditing: false,
                id: null,
                title: '',
                description: '',
                resource_type: 'link',
                file_url: '',
                subjectId: '',
                is_downloadable: false,
            });
        } catch (error) {
            console.error('Failed to save resource:', error);
            toast.error(resourceModal.isEditing ? 'Failed to update resource' : 'Failed to add resource');
        } finally {
            setSaving(false);
        }
    };

    const openCreateModal = () => {
        setResourceModal({
            isOpen: true,
            isEditing: false,
            id: null,
            title: '',
            description: '',
            resource_type: 'link',
            file_url: '',
            subjectId: '',
            is_downloadable: false,
        });
    };

    const openEditModal = (r: any) => {
        setResourceModal({
            isOpen: true,
            isEditing: true,
            id: r.id,
            title: r.title,
            description: r.description || '',
            resource_type: r.resource_type || 'link',
            file_url: r.file_url || r.external_link || '',
            subjectId: r.subject_id || '',
            is_downloadable: r.is_downloadable || false,
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-spin" />
            </div>
        );
    }

    const getIcon = (type: string) => {
        switch (type?.toLowerCase()) {
            case 'video': return <Video className="w-6 h-6" />;
            case 'pdf': return <FileText className="w-6 h-6" />;
            case 'link': return <LinkIcon className="w-6 h-6" />;
            default: return <File className="w-6 h-6" />;
        }
    };

    const getColor = (type: string) => {
        switch (type?.toLowerCase()) {
            case 'video': return 'bg-red-100 text-red-600';
            case 'pdf': return 'bg-orange-100 text-orange-600';
            case 'link': return 'bg-blue-100 text-blue-600';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl shadow-xl p-6 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold mb-2">Course Resources</h2>
                        <p className="text-emerald-100">Manage study materials and files</p>
                    </div>
                    <div className="text-right">
                        <div className="text-4xl font-bold">{resources.length}</div>
                        <div className="text-emerald-100">Total Resources</div>
                    </div>
                </div>
            </div>

            {/* Resources List */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden transition-colors duration-300">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">All Resources</h3>
                    <button
                        onClick={openCreateModal}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 dark:bg-emerald-500 text-white rounded-lg hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Add Resource
                    </button>
                </div>

                {resources.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        <File className="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-gray-500" />
                        <p>No resources found for this course</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {resources.map((resource) => (
                            <div
                                key={resource.id}
                                className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`flex items-center justify-center w-12 h-12 rounded-full ${getColor(resource.type)}`}>
                                            {getIcon(resource.type)}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
                                                {resource.title}
                                            </h4>
                                            <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                                                {resource.description || 'No description provided'}
                                            </p>
                                            <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                                                <div className="flex items-center gap-2">
                                                    <span className="uppercase text-xs font-bold px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-gray-600 dark:text-gray-400">
                                                        {resource.type}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span>Added {format(new Date(resource.created_at), 'MMM d, yyyy')}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <a
                                            href={resource.url || resource.file_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                                            title="View/Download"
                                        >
                                            {resource.type === 'link' ? <ExternalLink className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                                        </a>
                                        <button
                                            onClick={() => openEditModal(resource)}
                                            className="p-2 text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                                            title="Edit Resource"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => setDeleteModal({ isOpen: true, resourceId: resource.id, title: resource.title })}
                                            className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                            title="Delete Resource"
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
                onClose={() => setDeleteModal({ isOpen: false, resourceId: null, title: '' })}
                onConfirm={handleDelete}
                title="Delete Resource"
                message="Are you sure you want to delete this resource? This action cannot be undone."
                itemName={deleteModal.title}
                loading={deleting}
            />

            {/* Resource Modal */}
            {resourceModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                {resourceModal.isEditing ? 'Edit Resource' : 'Add New Resource'}
                            </h3>
                            <button
                                onClick={() => setResourceModal({ ...resourceModal, isOpen: false })}
                                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSaveResource}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Resource Title <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={resourceModal.title}
                                        onChange={(e) => setResourceModal({ ...resourceModal, title: e.target.value })}
                                        className="w-full px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                        placeholder="e.g. Course Syllabus"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Resource Type
                                    </label>
                                    <select
                                        value={resourceModal.resource_type}
                                        onChange={(e) => setResourceModal({ ...resourceModal, resource_type: e.target.value })}
                                        className="w-full px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                    >
                                        <option value="link">Link</option>
                                        <option value="pdf">PDF</option>
                                        <option value="video">Video</option>
                                        <option value="file">File</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        URL / File Link <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="url"
                                        value={resourceModal.file_url}
                                        onChange={(e) => setResourceModal({ ...resourceModal, file_url: e.target.value })}
                                        className="w-full px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                        placeholder="https://..."
                                        required
                                    />
                                </div>

                                {subjects.length > 0 && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Subject (Optional)
                                        </label>
                                        <select
                                            value={resourceModal.subjectId}
                                            onChange={(e) => setResourceModal({ ...resourceModal, subjectId: e.target.value })}
                                            className="w-full px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                        >
                                            <option value="">Select a subject</option>
                                            {subjects.map((s) => (
                                                <option key={s.id} value={s.id}>{s.title}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        value={resourceModal.description}
                                        onChange={(e) => setResourceModal({ ...resourceModal, description: e.target.value })}
                                        className="w-full px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                        placeholder="Brief description..."
                                        rows={3}
                                    />
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setResourceModal({ ...resourceModal, isOpen: false })}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving || !resourceModal.title || !resourceModal.file_url}
                                    className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-700 dark:hover:bg-emerald-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {saving ? 'Saving...' : (resourceModal.isEditing ? 'Save Changes' : 'Add Resource')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
