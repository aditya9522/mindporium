import { useState, useEffect } from 'react';
import { announcementService } from '../../services/announcement.service';
import { useAuthStore } from '../../store/auth.store';
import { Loader2, Plus, Edit, Trash2, Pin, MessageSquare } from 'lucide-react';
import { AnnouncementSkeleton } from '../../components/ui/AnnouncementSkeleton';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { DeleteConfirmationModal } from '../../components/common/DeleteConfirmationModal';

export const AnnouncementManagementPage = () => {
    const { user } = useAuthStore();
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingAnnouncement, setEditingAnnouncement] = useState<any | null>(null);
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; announcement: any | null }>({
        isOpen: false,
        announcement: null
    });
    const [deleting, setDeleting] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        content: '',
        course_id: null as number | null,
        subject_id: null as number | null,
        is_pinned: false,
        is_active: true,
    });

    useEffect(() => {
        loadAnnouncements();
    }, []);

    const loadAnnouncements = async () => {
        try {
            let data;
            if (user?.role === 'admin') {
                data = await announcementService.getAllAnnouncements();
            } else {
                data = await announcementService.getMyAnnouncements();
            }
            setAnnouncements(data);
        } catch (error) {
            console.error('Failed to load announcements:', error);
            toast.error('Failed to load announcements');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await announcementService.createAnnouncement(formData);
            toast.success('Announcement created successfully');
            setShowCreateModal(false);
            resetForm();
            loadAnnouncements();
        } catch (error) {
            console.error('Failed to create announcement:', error);
            toast.error('Failed to create announcement');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingAnnouncement) return;
        setIsSubmitting(true);
        try {
            await announcementService.updateAnnouncement(editingAnnouncement.id, formData);
            toast.success('Announcement updated successfully');
            setEditingAnnouncement(null);
            resetForm();
            loadAnnouncements();
        } catch (error) {
            console.error('Failed to update announcement:', error);
            toast.error('Failed to update announcement');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteModal.announcement) return;

        setDeleting(true);
        try {
            await announcementService.deleteAnnouncement(deleteModal.announcement.id);
            setAnnouncements(announcements.filter(a => a.id !== deleteModal.announcement.id));
            setDeleteModal({ isOpen: false, announcement: null });
            toast.success('Announcement deleted successfully');
        } catch (error) {
            console.error('Failed to delete announcement:', error);
            toast.error('Failed to delete announcement');
        } finally {
            setDeleting(false);
        }
    };

    const handleEdit = (announcement: any) => {
        setEditingAnnouncement(announcement);
        setFormData({
            title: announcement.title,
            content: announcement.content,
            course_id: announcement.course_id,
            subject_id: announcement.subject_id,
            is_pinned: announcement.is_pinned,
            is_active: announcement.is_active,
        });
    };

    const resetForm = () => {
        setFormData({
            title: '',
            content: '',
            course_id: null,
            subject_id: null,
            is_pinned: false,
            is_active: true,
        });
    };

    // if (loading) {
    //     return <PageLoader />;
    // }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Announcements</h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">Manage platform-wide and course-specific announcements.</p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20"
                    >
                        <Plus className="w-5 h-5" />
                        Create Announcement
                    </button>
                </div>

                {loading ? (
                    <AnnouncementSkeleton count={4} />
                ) : announcements.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                        <MessageSquare className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No announcements yet</h3>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">Create your first announcement to get started.</p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {announcements.map((announcement) => (
                            <div key={announcement.id} className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{announcement.title}</h3>
                                            {announcement.is_pinned && (
                                                <Pin className="w-4 h-4 text-amber-500 fill-current" />
                                            )}
                                            {!announcement.is_active && (
                                                <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-semibold rounded-full">
                                                    Inactive
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{announcement.content}</p>
                                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                                            {announcement.created_at ? formatDistanceToNow(new Date(announcement.created_at), { addSuffix: true }) : 'Recently'}
                                        </p>
                                    </div>
                                    <div className="flex gap-2 ml-4">
                                        <button
                                            onClick={() => handleEdit(announcement)}
                                            className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                                        >
                                            <Edit className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => setDeleteModal({ isOpen: true, announcement })}
                                            className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            {(showCreateModal || editingAnnouncement) && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-gray-800">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                            {editingAnnouncement ? 'Edit Announcement' : 'Create Announcement'}
                        </h2>
                        <form onSubmit={editingAnnouncement ? handleUpdate : handleCreate}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                        placeholder="Announcement title"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Content</label>
                                    <textarea
                                        required
                                        value={formData.content}
                                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none h-32 resize-none"
                                        placeholder="Announcement content"
                                    />
                                </div>
                                <div className="flex items-center gap-6">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.is_pinned}
                                            onChange={(e) => setFormData({ ...formData, is_pinned: e.target.checked })}
                                            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                        />
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Pin this announcement</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.is_active}
                                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                        />
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Active</span>
                                    </label>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-8">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        setEditingAnnouncement(null);
                                        resetForm();
                                    }}
                                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        editingAnnouncement ? 'Update' : 'Create'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, announcement: null })}
                onConfirm={handleDelete}
                title="Delete Announcement"
                message="Are you sure you want to delete this announcement? This action cannot be undone."
                itemName={deleteModal.announcement?.title}
                loading={deleting}
            />
        </div>
    );
};
