import { useEffect, useState } from 'react';
import { instructorService } from '../../services/instructor.service';
import type { InstructorDashboard } from '../../types/instructor';
import { StatsCard } from '../../components/instructor/StatsCard';
import { BookOpen, Users, DollarSign, TrendingUp, Plus, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { StatsCardSkeleton } from '../../components/ui/StatsCardSkeleton';
import { WidgetSkeleton } from '../../components/ui/WidgetSkeleton';

export const InstructorDashboardPage = () => {
    const [dashboard, setDashboard] = useState<InstructorDashboard | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const data = await instructorService.getDashboard();
                setDashboard(data);
            } catch (error) {
                console.error('Failed to fetch dashboard:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, []);



    if (!dashboard && !loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-500">Failed to load dashboard</p>
            </div>
        );
    }

    const d = dashboard as InstructorDashboard;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 tracking-tight">Instructor Dashboard</h1>
                        <p className="mt-2 text-lg text-gray-500 dark:text-gray-400 font-medium">Manage your courses and track your teaching performance.</p>
                    </div>
                    <Link
                        to="/instructor/courses/create"
                        className="mt-4 md:mt-0 inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl shadow-lg shadow-primary-200 dark:shadow-primary-900/30 hover:shadow-primary-300 dark:hover:shadow-primary-800/50 transition-all transform hover:-translate-y-0.5 font-bold"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Create Course
                    </Link>
                </div>

                {/* Stats Grid */}
                {loading ? (
                    <div className="mb-8"><StatsCardSkeleton count={4} /></div>
                ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatsCard
                        title="Total Courses"
                        value={d.total_courses || 0}
                        icon={BookOpen}
                        color="blue"
                    />
                    <StatsCard
                        title="Total Students"
                        value={d.total_students || 0}
                        icon={Users}
                        color="green"
                    />
                    <StatsCard
                        title="Revenue"
                        value={`$${d.total_revenue?.toLocaleString() || 0}`}
                        icon={DollarSign}
                        color="purple"
                    />
                    <StatsCard
                        title="Active Courses"
                        value={d.active_courses || 0}
                        icon={TrendingUp}
                        color="orange"
                    />
                </div>
                )}

                {loading ? (
                    <div className="mb-8"><WidgetSkeleton count={2} /></div>
                ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Recent Enrollments */}
                    <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-[0_2px_15px_rgb(0,0,0,0.04)] dark:shadow-[0_2px_15px_rgb(0,0,0,0.2)] border border-gray-100 dark:border-gray-800 p-8 transition-colors duration-300">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
                            <div className="p-2 bg-primary-50 dark:bg-primary-900/30 rounded-lg text-primary-600 dark:text-primary-400"><Users className="w-5 h-5" /></div>
                            Recent Enrollments
                        </h2>
                        {d.recent_enrollments && d.recent_enrollments.length > 0 ? (
                            <div className="space-y-4">
                                {d.recent_enrollments.slice(0, 5).map((enrollment) => (
                                    <div key={enrollment.id} className="flex items-center justify-between p-4 bg-white dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300">
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-gray-100">{enrollment.user_name}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{enrollment.course_title}</p>
                                        </div>
                                        <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700/50 px-2.5 py-1 rounded-full border border-gray-100 dark:border-gray-600">
                                            {format(new Date(enrollment.enrolled_at), 'MMM d')}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10">
                                <p className="text-gray-400 dark:text-gray-500 font-medium">No recent enrollments</p>
                            </div>
                        )}
                    </div>

                    {/* Upcoming Classes */}
                    <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-[0_2px_15px_rgb(0,0,0,0.04)] dark:shadow-[0_2px_15px_rgb(0,0,0,0.2)] border border-gray-100 dark:border-gray-800 p-8 transition-colors duration-300">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
                            <div className="p-2 bg-primary-50 dark:bg-primary-900/30 rounded-lg text-primary-600 dark:text-primary-400"><Calendar className="w-5 h-5" /></div>
                            Upcoming Classes
                        </h2>
                        {d.upcoming_classes && d.upcoming_classes.length > 0 ? (
                            <div className="space-y-4">
                                {d.upcoming_classes.slice(0, 5).map((classroom) => {
                                    const typeStyles: Record<string, string> = {
                                        trial: 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border-orange-100 dark:border-orange-800',
                                        free: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800',
                                        regular: 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 border-primary-100 dark:border-primary-800',
                                        extra: 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-800',
                                    };

                                    const typeLabels: Record<string, string> = {
                                        trial: 'Trial',
                                        free: 'Free',
                                        regular: 'Regular',
                                        extra: 'Extra',
                                    };

                                    const type = classroom.class_type || 'regular';
                                    const isLive = classroom.status === 'live';

                                    return (
                                        <div key={classroom.id} className="flex items-start justify-between p-4 bg-white dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300">
                                            <div className="flex-1">
                                                <p className="font-bold text-gray-900 dark:text-gray-100">{classroom.title}</p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{classroom.subject_title}</p>
                                                <p className="text-xs text-primary-600 dark:text-primary-400 font-semibold mt-1.5 flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {(classroom.scheduled_at || classroom.start_time) && !isNaN(new Date(classroom.scheduled_at || classroom.start_time || '').getTime())
                                                        ? format(new Date(classroom.scheduled_at || classroom.start_time || ''), 'MMM d, h:mm a')
                                                        : 'Date not set'}
                                                </p>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                {isLive && (
                                                    <span className="text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter bg-red-500 text-white animate-pulse shadow-sm shadow-red-200">
                                                        Live Now
                                                    </span>
                                                )}
                                                <span className={`text-xs px-2.5 py-1 rounded-full font-bold shadow-sm border ${typeStyles[type] || typeStyles.regular}`}>
                                                    {typeLabels[type] || 'Class'}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-10">
                                <p className="text-gray-400 dark:text-gray-500 font-medium">No upcoming classes</p>
                            </div>
                        )}
                    </div>
                </div>
                )}

                {/* Course Performance */}
                {loading ? (
                    <div className="mt-8"><WidgetSkeleton count={1} className="grid grid-cols-1 w-full" /></div>
                ) : d.course_stats && d.course_stats.length > 0 && (
                    <div className="mt-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-[0_2px_15px_rgb(0,0,0,0.04)] dark:shadow-[0_2px_15px_rgb(0,0,0,0.2)] border border-gray-100 dark:border-gray-800 p-8 transition-colors duration-300">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
                            <div className="p-2 bg-primary-50 dark:bg-primary-900/30 rounded-lg text-primary-600 dark:text-primary-400"><TrendingUp className="w-5 h-5" /></div>
                            Course Performance
                        </h2>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-100 dark:border-gray-800">
                                        <th className="text-left py-4 px-4 text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Course</th>
                                        <th className="text-left py-4 px-4 text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Enrollments</th>
                                        <th className="text-left py-4 px-4 text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Active Students</th>
                                        <th className="text-left py-4 px-4 text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Completion Rate</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                                    {d.course_stats.map((course) => (
                                        <tr key={course.course_id} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/50 transition-colors group">
                                            <td className="py-4 px-4">
                                                <Link
                                                    to={`/instructor/courses/${course.course_id}/view`}
                                                    className="font-bold text-gray-900 dark:text-gray-100 hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-lg"
                                                >
                                                    {course.course_title}
                                                </Link>
                                            </td>
                                            <td className="py-4 px-4 text-gray-600 dark:text-gray-400 font-medium group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors">{course.total_enrollments}</td>
                                            <td className="py-4 px-4 text-gray-600 dark:text-gray-400 font-medium group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors">{course.active_students}</td>
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-gray-900 dark:text-gray-100 font-bold">{course.completion_rate}%</span>
                                                    <div className="w-24 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                                        <div className="h-full bg-primary-500 dark:bg-primary-400 rounded-full" style={{ width: `${course.completion_rate}%` }}></div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
