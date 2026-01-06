import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Bell, Pin, Calendar, User } from 'lucide-react';
import api from '../../lib/axios';
import { PageLoader } from '../../components/common/PageLoader';

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
        return <PageLoader />;
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 py-8 px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
                    <p className="text-gray-500 mt-1">Updates and news from your instructors</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filter === 'all'
                        ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-600 ring-offset-2'
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                        }`}
                >
                    All Updates
                </button>
                <button
                    onClick={() => setFilter('general')}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filter === 'general'
                        ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-600 ring-offset-2'
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
                            ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-600 ring-offset-2'
                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                            }`}
                    >
                        {subject.title}
                    </button>
                ))}
            </div>

            {announcements.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Bell className="w-8 h-8 text-gray-300" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No announcements yet</h3>
                    <p className="text-gray-500 mt-2">Check back later for updates.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {announcements
                        .filter(a => {
                            if (filter === 'all') return true;
                            if (filter === 'general') return !a.subject_id;
                            return a.subject_id === filter;
                        })
                        .map((announcement) => (
                            <div
                                key={announcement.id}
                                className={`bg-white rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-lg transition-all border flex flex-col ${announcement.is_pinned
                                    ? 'border-indigo-200 ring-1 ring-indigo-50 bg-indigo-50/10'
                                    : 'border-gray-200'
                                    }`}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="space-y-3 w-full">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="space-y-1">
                                                {announcement.is_pinned && (
                                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-1 rounded-md mb-2">
                                                        <Pin className="w-3 h-3" />
                                                        Pinned
                                                    </span>
                                                )}
                                                <h3 className="text-lg font-bold text-gray-900 leading-tight">{announcement.title}</h3>
                                            </div>
                                            <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center ring-2 ring-white shadow-sm">
                                                {announcement.creator?.photo ? (
                                                    <img src={announcement.creator.photo} alt={announcement.creator.full_name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-xs font-bold text-gray-500">
                                                        {announcement.creator?.full_name?.charAt(0) || <User className="w-3 h-3" />}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 text-xs text-gray-500 pb-3 border-b border-gray-100/50">
                                            <span className="font-semibold text-gray-700">{announcement.creator?.full_name || 'Instructor'}</span>
                                            <span>•</span>
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-3.5 h-3.5" />
                                                <span>{new Date(announcement.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="prose prose-sm max-w-none text-gray-600 flex-1">
                                    <p className="whitespace-pre-wrap line-clamp-[8]">{announcement.content}</p>
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-50">
                                    <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700">Read more</button>
                                </div>
                            </div>
                        ))}
                </div>
            )}
        </div>
    );
};
