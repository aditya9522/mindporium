import { useState, useEffect } from 'react';
import { announcementService, type Announcement } from '../../services/announcement.service';
import { Loader2, Bell, Pin, Trash2, Plus } from 'lucide-react';
import { Button } from '../ui/Button';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

interface AnnouncementsListProps {
    courseId: number;
    isInstructor?: boolean;
}

export const AnnouncementsList = ({ courseId, isInstructor = false }: AnnouncementsListProps) => {
    const [loading, setLoading] = useState(true);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [showCreate, setShowCreate] = useState(false);
    const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '', is_pinned: false });

    useEffect(() => {
        fetchAnnouncements();
    }, [courseId]);

    const fetchAnnouncements = async () => {
        try {
            const data = await announcementService.getCourseAnnouncements(courseId);
            setAnnouncements(data);
        } catch (error) {
            console.error('Failed to fetch announcements:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await announcementService.createAnnouncement({
                ...newAnnouncement,
                course_id: courseId,
                is_active: true
            });
            toast.success('Announcement posted');
            setNewAnnouncement({ title: '', content: '', is_pinned: false });
            setShowCreate(false);
            fetchAnnouncements();
        } catch (error) {
            toast.error('Failed to post announcement');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this announcement?')) return;
        try {
            await announcementService.deleteAnnouncement(id);
            toast.success('Announcement deleted');
            fetchAnnouncements();
        } catch (error) {
            toast.error('Failed to delete announcement');
        }
    };

    if (loading) {
        return <Loader2 className="w-6 h-6 animate-spin text-indigo-600 mx-auto" />;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-indigo-600" />
                    Announcements
                </h3>
                {isInstructor && (
                    <Button size="sm" onClick={() => setShowCreate(!showCreate)}>
                        <Plus className="w-4 h-4 mr-2" />
                        New Announcement
                    </Button>
                )}
            </div>

            {showCreate && (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 animate-fade-in-down">
                    <form onSubmit={handleCreate}>
                        <div className="mb-3">
                            <input
                                type="text"
                                placeholder="Title"
                                className="w-full px-3 py-2 border rounded-md"
                                value={newAnnouncement.title}
                                onChange={e => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <textarea
                                placeholder="Content"
                                className="w-full px-3 py-2 border rounded-md h-24"
                                value={newAnnouncement.content}
                                onChange={e => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                                required
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 text-sm text-gray-600">
                                <input
                                    type="checkbox"
                                    checked={newAnnouncement.is_pinned}
                                    onChange={e => setNewAnnouncement({ ...newAnnouncement, is_pinned: e.target.checked })}
                                />
                                Pin to top
                            </label>
                            <div className="flex gap-2">
                                <Button type="button" variant="ghost" size="sm" onClick={() => setShowCreate(false)}>Cancel</Button>
                                <Button type="submit" size="sm">Post</Button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            <div className="space-y-4">
                {announcements.length > 0 ? (
                    announcements.map((announcement) => (
                        <div key={announcement.id} className={`bg-white p-4 rounded-lg border ${announcement.is_pinned ? 'border-indigo-200 bg-indigo-50' : 'border-gray-100'}`}>
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h4 className="font-bold text-gray-900 flex items-center gap-2">
                                        {announcement.is_pinned && <Pin className="w-3 h-3 text-indigo-600 fill-current" />}
                                        {announcement.title}
                                    </h4>
                                    <p className="text-xs text-gray-500">
                                        {formatDistanceToNow(new Date(announcement.created_at), { addSuffix: true })}
                                    </p>
                                </div>
                                {isInstructor && (
                                    <button
                                        onClick={() => handleDelete(announcement.id)}
                                        className="text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                            <p className="text-gray-600 text-sm whitespace-pre-wrap">{announcement.content}</p>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                        <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                        <p>No announcements yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
