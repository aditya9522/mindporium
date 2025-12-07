import { useState, useEffect } from 'react';
import { Megaphone, Calendar, User, Plus, Trash2, Edit, X } from 'lucide-react';
import { announcementService } from '../../../services/announcement.service';
import toast from 'react-hot-toast';
import { DeleteConfirmationModal } from '../../../components/modals/DeleteConfirmationModal';
import { format } from 'date-fns';

interface AnnouncementsTabProps {
    courseData: any;
}

export const AnnouncementsTab = ({ courseData }: AnnouncementsTabProps) => {
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; announcementId: number | null; title: string }>({
        isOpen: false,
        announcementId: null,
        title: ''
    });
    const [deleting, setDeleting] = useState(false);

    // Announcement Modal State
    const [announcementModal, setAnnouncementModal] = useState({
        isOpen: false,
        isEditing: false,
        id: null as number | null,
        title: '',
        content: '',
        is_pinned: false
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (courseData?.course?.id) {
            fetchAnnouncements();
        }
    }, [courseData]);

    const fetchAnnouncements = async () => {
        try {
            const data = await announcementService.getCourseAnnouncements(courseData.course.id);
            setAnnouncements(data);
        } catch (error) {
            console.error('Failed to fetch announcements:', error);
            // toast.error('Failed to load announcements');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteModal.announcementId) return;
        setDeleting(true);
        try {
            await announcementService.deleteAnnouncement(deleteModal.announcementId);
            setAnnouncements(announcements.filter(a => a.id !== deleteModal.announcementId));
            toast.success('Announcement deleted successfully');
            setDeleteModal({ isOpen: false, announcementId: null, title: '' });
        } catch (error) {
            console.error('Failed to delete announcement:', error);
            toast.error('Failed to delete announcement');
        } finally {
            setDeleting(false);
        }
    };

    const handleSaveAnnouncement = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!announcementModal.title || !announcementModal.content) return;

        setSaving(true);
        try {
            const payload: any = {
                title: announcementModal.title,
                content: announcementModal.content,
                is_pinned: announcementModal.is_pinned,
                course_id: courseData.course.id
            };

            if (announcementModal.isEditing && announcementModal.id) {
                await announcementService.updateAnnouncement(announcementModal.id, payload);
                toast.success('Announcement updated successfully');
            } else {
                await announcementService.createAnnouncement(payload);
                toast.success('Announcement created successfully');
            }

            fetchAnnouncements();
            setAnnouncementModal({
                isOpen: false,
                isEditing: false,
                id: null,
                title: '',
                content: '',
                is_pinned: false
            });
        } catch (error) {
            console.error('Failed to save announcement:', error);
            toast.error(announcementModal.isEditing ? 'Failed to update announcement' : 'Failed to create announcement');
        } finally {
            setSaving(false);
        }
    };

    const openCreateModal = () => {
        setAnnouncementModal({
            isOpen: true,
            isEditing: false,
            id: null,
            title: '',
            content: '',
            is_pinned: false
        });
    };

    const openEditModal = (a: any) => {
        setAnnouncementModal({
            isOpen: true,
            isEditing: true,
            id: a.id,
            title: a.title,
            content: a.content,
            is_pinned: a.is_pinned
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl shadow-xl p-6 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold mb-2">Announcements</h2>
                        <p className="text-orange-100">Manage course updates and news</p>
                    </div>
                    <div className="text-right">
                        <div className="text-4xl font-bold">{announcements.length}</div>
                        <div className="text-orange-100">Total Updates</div>
                    </div>
                </div>
            </div>

            {/* Announcements List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-900">All Announcements</h3>
                    <button
                        onClick={openCreateModal}
                        className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        New Announcement
                    </button>
                </div>

                {announcements.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <Megaphone className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                        <p>No announcements found for this course</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {announcements.map((announcement) => (
                            <div
                                key={announcement.id}
                                className={`p-6 hover:bg-gray-50 transition-colors ${announcement.is_pinned ? 'bg-orange-50/50' : ''}`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4 flex-1">
                                        <div className={`flex items-center justify-center w-12 h-12 rounded-full ${announcement.is_pinned ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600'}`}>
                                            <Megaphone className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-1">
                                                <h4 className="text-lg font-bold text-gray-900">
                                                    {announcement.title}
                                                </h4>
                                                {announcement.is_pinned && (
                                                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-orange-100 text-orange-700 border border-orange-200">
                                                        PINNED
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-gray-600 mb-3 whitespace-pre-wrap">
                                                {announcement.content}
                                            </p>
                                            <div className="flex items-center gap-6 text-sm text-gray-500">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>{format(new Date(announcement.created_at), 'MMM d, yyyy')}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <User className="w-4 h-4" />
                                                    <span>Posted by Instructor</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => openEditModal(announcement)}
                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Edit Announcement"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => setDeleteModal({ isOpen: true, announcementId: announcement.id, title: announcement.title })}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete Announcement"
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
                onClose={() => setDeleteModal({ isOpen: false, announcementId: null, title: '' })}
                onConfirm={handleDelete}
                title="Delete Announcement"
                message="Are you sure you want to delete this announcement? This action cannot be undone."
                itemName={deleteModal.title}
                loading={deleting}
            />

            {/* Announcement Modal */}
            {announcementModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-900">
                                {announcementModal.isEditing ? 'Edit Announcement' : 'New Announcement'}
                            </h3>
                            <button
                                onClick={() => setAnnouncementModal({ ...announcementModal, isOpen: false })}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSaveAnnouncement}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Title <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={announcementModal.title}
                                        onChange={(e) => setAnnouncementModal({ ...announcementModal, title: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        placeholder="e.g. Exam Schedule Update"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Content <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={announcementModal.content}
                                        onChange={(e) => setAnnouncementModal({ ...announcementModal, content: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        placeholder="Write your announcement here..."
                                        rows={5}
                                        required
                                    />
                                </div>

                                <div className="flex items-center pt-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={announcementModal.is_pinned}
                                            onChange={(e) => setAnnouncementModal({ ...announcementModal, is_pinned: e.target.checked })}
                                            className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                                        />
                                        <span className="text-sm font-medium text-gray-700">Pin to top</span>
                                    </label>
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setAnnouncementModal({ ...announcementModal, isOpen: false })}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving || !announcementModal.title || !announcementModal.content}
                                    className="px-4 py-2 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {saving ? 'Saving...' : (announcementModal.isEditing ? 'Save Changes' : 'Post Announcement')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
