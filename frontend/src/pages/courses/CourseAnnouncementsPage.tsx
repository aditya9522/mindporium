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
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Announcements</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Updates and news from your instructors</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filter === 'all'
                        ? 'bg-primary-600 text-white shadow-sm ring-2 ring-primary-600 ring-offset-2 dark:ring-offset-gray-900'
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                >
                    All Updates
                </button>
                <button
                    onClick={() => setFilter('general')}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filter === 'general'
                        ? 'bg-primary-600 text-white shadow-sm ring-2 ring-primary-600 ring-offset-2 dark:ring-offset-gray-900'
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                >
                    Course General
                </button>
                {subjects.map(subject => (
                    <button
                        key={subject.id}
                        onClick={() => setFilter(subject.id)}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filter === subject.id
                            ? 'bg-primary-600 text-white shadow-sm ring-2 ring-primary-600 ring-offset-2 dark:ring-offset-gray-900'
                            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                    >
                        {subject.title}
                    </button>
                ))}
            </div>

            {announcements.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                    <div className="w-16 h-16 bg-gray-50 dark:bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Bell className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">No announcements yet</h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Check back later for updates.</p>
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
                                className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-none hover:shadow-lg dark:hover:bg-gray-750 transition-all border flex flex-col ${announcement.is_pinned
                                    ? 'border-primary-200 dark:border-primary-800 ring-1 ring-primary-50 dark:ring-primary-900/50 bg-primary-50/10 dark:bg-primary-900/10'
                                    : 'border-gray-200 dark:border-gray-700'
                                    }`}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="space-y-3 w-full">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="space-y-1">
                                                {announcement.is_pinned && (
                                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-primary-700 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-2 py-1 rounded-md mb-2">
                                                        <Pin className="w-3 h-3" />
                                                        Pinned
                                                    </span>
                                                )}
                                                <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">{announcement.title}</h3>
                                            </div>
                                            <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0 flex items-center justify-center ring-2 ring-white dark:ring-gray-900 shadow-sm">
                                                {announcement.creator?.photo ? (
                                                    <img src={announcement.creator.photo} alt={announcement.creator.full_name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                                                        {announcement.creator?.full_name?.charAt(0) || <User className="w-3 h-3" />}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 pb-3 border-b border-gray-100/50 dark:border-gray-700/50">
                                            <span className="font-semibold text-gray-700 dark:text-gray-200">{announcement.creator?.full_name || 'Instructor'}</span>
                                            <span>•</span>
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-3.5 h-3.5" />
                                                <span>{new Date(announcement.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="prose prose-sm max-w-none text-gray-600 dark:text-gray-300 flex-1">
                                    <p className="whitespace-pre-wrap line-clamp-[8]">{announcement.content}</p>
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-50 dark:border-gray-700">
                                    <button className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">Read more</button>
                                </div>
                            </div>
                        ))}
                </div>
            )}
        </div>
    );
};
