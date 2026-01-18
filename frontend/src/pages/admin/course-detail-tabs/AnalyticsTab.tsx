import { useState, useEffect } from 'react';
import { instructorService } from '../../../services/instructor.service';
import type { CourseOverview } from '../../../types/instructor';
import { Users, TrendingUp, Star, Award, BookOpen, Activity } from 'lucide-react';
import { PageLoader } from '../../../components/common/PageLoader';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AnalyticsTabProps {
    courseId: number;
}

export const AnalyticsTab = ({ courseId }: AnalyticsTabProps) => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<CourseOverview | null>(null);

    useEffect(() => {
        if (courseId) {
            fetchAnalytics();
        }
    }, [courseId]);

    const fetchAnalytics = async () => {
        try {
            const overview = await instructorService.getCourseOverview(courseId);
            setData(overview);
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <PageLoader />;
    }

    if (!data) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <p className="text-gray-500 dark:text-gray-400">Failed to load analytics</p>
            </div>
        );
    }

    const subjectData = data.subjects.map(subject => ({
        name: subject.title.length > 15 ? subject.title.substring(0, 15) + '...' : subject.title,
        classes: subject.total_classes,
    }));

    const engagementData = [
        { name: 'Active', value: data.statistics.active_students },
        { name: 'Inactive', value: data.statistics.total_enrollments - data.statistics.active_students },
    ];

    const COLORS = ['#4F46E5', '#E5E7EB'];

    return (
        <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 transition-colors duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                            <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="text-xs font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-full">
                            +{data.statistics.recent_enrollments_7d}
                        </span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{data.statistics.total_enrollments}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Enrollments</p>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 transition-colors duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-green-50 dark:bg-green-900/30 rounded-lg">
                            <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-full">
                            Rate: {data.engagement.active_student_rate}%
                        </span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{data.statistics.active_students}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Active Students</p>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 transition-colors duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                            <Award className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{data.statistics.completion_rate}%</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Completion Rate</p>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 transition-colors duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
                            <Star className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-full">
                            {data.statistics.total_feedback} reviews
                        </span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{data.statistics.average_rating}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Average Rating</p>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Subject Classes Chart */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 transition-colors duration-300">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        Classes per Subject
                    </h2>
                    {subjectData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={subjectData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} className="dark:opacity-20" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    cursor={{ fill: '#f3f4f6' }}
                                    wrapperClassName="dark:!bg-gray-800 dark:!text-white rounded-xl"
                                />
                                <Bar dataKey="classes" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[300px] flex items-center justify-center text-gray-400 italic">
                            No subjects yet
                        </div>
                    )}
                </div>

                {/* Student Engagement Chart */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 transition-colors duration-300">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        Student Engagement
                    </h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={engagementData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {engagementData.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                wrapperClassName="dark:!bg-gray-800 dark:!text-white rounded-xl"
                            />
                            <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};


