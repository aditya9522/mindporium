import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2, Bell, Pin, Calendar, User } from 'lucide-react';
import api from '../../lib/axios';

interface Announcement {
    id: number;
    title: string;
    content: string;
    is_pinned: boolean;
    created_at: string;
    created_by: number;
    subject_id?: number | null;
    creator?: {
        id: number;
        full_name: string;
        photo?: string;
    };
}

interface Subject {
    id: number;
    title: string;
}

export const CourseAnnouncementsPage = () => {
    const { id } = useParams();
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'general' | number>('all');

    useEffect(() => {
        if (id) {
            loadData();
        }
    }, [id]);

    const loadData = async () => {
        try {
            const [announcementsRes, subjectsRes] = await Promise.all([
                api.get(`/announcements/course/${id}`),
                api.get(`/subjects/course/${id}`)
            ]);
            setAnnouncements(announcementsRes.data);
            setSubjects(subjectsRes.data);
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 py-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
                <p className="text-gray-500 mt-1">Updates and news from your instructors</p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 mb-6">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filter === 'all'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                        }`}
                >
                    All Updates
                </button>
                <button
                    onClick={() => setFilter('general')}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filter === 'general'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                        }`}
                >
                    Course General
                </button>
                {subjects.map(subject => (
                    <button
                        key={subject.id}
                        onClick={() => setFilter(subject.id)}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filter === subject.id
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                            }`}
                    >
                        {subject.title}
                    </button>
                ))}
            </div>

            {announcements.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                    <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No announcements yet</h3>
                    <p className="text-gray-500 mt-2">Check back later for updates.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {announcements
                        .filter(a => {
                            if (filter === 'all') return true;
                            if (filter === 'general') return !a.subject_id;
                            return a.subject_id === filter;
                        })
                        .map((announcement) => (
                            <div
                                key={announcement.id}
                                className={`bg-white rounded-xl p-6 shadow-sm border ${announcement.is_pinned ? 'border-indigo-200 ring-1 ring-indigo-50' : 'border-gray-200'
                                    }`}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            {announcement.is_pinned && (
                                                <span className="flex items-center gap-1 text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                                                    <Pin className="w-3 h-3" />
                                                    Pinned
                                                </span>
                                            )}
                                            <h3 className="text-lg font-bold text-gray-900">{announcement.title}</h3>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            {/* Instructor Info */}
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center">
                                                    {announcement.creator?.photo ? (
                                                        <img src={announcement.creator.photo} alt={announcement.creator.full_name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-xs font-bold text-gray-500">
                                                            {announcement.creator?.full_name?.charAt(0) || <User className="w-3 h-3" />}
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="font-medium text-gray-900">{announcement.creator?.full_name || 'Instructor'}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                <span>{new Date(announcement.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="prose prose-sm max-w-none text-gray-600">
                                    <p className="whitespace-pre-wrap">{announcement.content}</p>
                                </div>
                            </div>
                        ))}
                </div>
            )}
        </div>
    );
};
