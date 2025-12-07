import { useEffect, useState } from 'react';
import { instructorService } from '../../services/instructor.service';
import type { InstructorDashboard } from '../../types/instructor';
import { StatsCard } from '../../components/instructor/StatsCard';
import { BookOpen, Users, DollarSign, TrendingUp, Plus, Calendar, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

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

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (!dashboard) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-500">Failed to load dashboard</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Instructor Dashboard</h1>
                        <p className="mt-2 text-gray-600">Manage your courses and track your teaching performance.</p>
                    </div>
                    <Link
                        to="/instructor/courses/create"
                        className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Create Course
                    </Link>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatsCard
                        title="Total Courses"
                        value={dashboard.total_courses}
                        icon={BookOpen}
                        color="blue"
                    />
                    <StatsCard
                        title="Total Students"
                        value={dashboard.total_students}
                        icon={Users}
                        color="green"
                    />
                    <StatsCard
                        title="Revenue"
                        value={`$${dashboard?.total_revenue?.toLocaleString()}`}
                        icon={DollarSign}
                        color="purple"
                    />
                    <StatsCard
                        title="Active Courses"
                        value={dashboard.active_courses}
                        icon={TrendingUp}
                        color="orange"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Enrollments */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Enrollments</h2>
                        {dashboard.recent_enrollments && dashboard.recent_enrollments.length > 0 ? (
                            <div className="space-y-3">
                                {dashboard.recent_enrollments.slice(0, 5).map((enrollment) => (
                                    <div key={enrollment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div>
                                            <p className="font-medium text-gray-900">{enrollment.user_name}</p>
                                            <p className="text-sm text-gray-600">{enrollment.course_title}</p>
                                        </div>
                                        <span className="text-xs text-gray-500">
                                            {format(new Date(enrollment.enrolled_at), 'MMM d')}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center py-8">No recent enrollments</p>
                        )}
                    </div>

                    {/* Upcoming Classes */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                            <Calendar className="w-5 h-5 mr-2" />
                            Upcoming Classes
                        </h2>
                        {dashboard.upcoming_classes && dashboard.upcoming_classes.length > 0 ? (
                            <div className="space-y-3">
                                {dashboard.upcoming_classes.slice(0, 5).map((classroom) => (
                                    <div key={classroom.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">{classroom.title}</p>
                                            <p className="text-sm text-gray-600">{classroom.subject_title}</p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {classroom.scheduled_at && !isNaN(new Date(classroom.scheduled_at).getTime())
                                                    ? format(new Date(classroom.scheduled_at), 'MMM d, h:mm a')
                                                    : 'N/A'}
                                            </p>
                                        </div>
                                        <span className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded">
                                            {classroom.type}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center py-8">No upcoming classes</p>
                        )}
                    </div>
                </div>

                {/* Course Performance */}
                {dashboard.course_stats && dashboard.course_stats.length > 0 && (
                    <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Course Performance</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Course</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Enrollments</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Active Students</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Completion Rate</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dashboard.course_stats.map((course) => (
                                        <tr key={course.course_id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-3 px-4">
                                                <Link
                                                    to={`/instructor/courses/${course.course_id}`}
                                                    className="font-medium text-indigo-600 hover:text-indigo-700"
                                                >
                                                    {course.course_title}
                                                </Link>
                                            </td>
                                            <td className="py-3 px-4 text-gray-700">{course.total_enrollments}</td>
                                            <td className="py-3 px-4 text-gray-700">{course.active_students}</td>
                                            <td className="py-3 px-4">
                                                <span className="text-gray-700">{course.completion_rate}%</span>
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
