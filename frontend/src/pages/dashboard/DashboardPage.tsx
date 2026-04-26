import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/auth.store';
import { studentService } from '../../services/student.service';
import { BookOpen, Award, TrendingUp, Clock, Calendar } from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { Link } from 'react-router-dom';
import { StatsCardSkeleton } from '../../components/ui/StatsCardSkeleton';
import { WidgetSkeleton } from '../../components/ui/WidgetSkeleton';

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444'];

export const DashboardPage = () => {
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState<any>(null);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const data = await studentService.getDashboard();
                setDashboardData(data);
            } catch (error) {
                console.error('Failed to fetch dashboard:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, []);



    const stats = [
        {
            icon: BookOpen,
            label: 'Enrolled Courses',
            value: dashboardData?.overview?.total_courses || 0,
            color: 'bg-blue-500'
        },
        {
            icon: Clock,
            label: 'Classes Attended',
            value: dashboardData?.overview?.total_classes_attended || 0,
            color: 'bg-green-500'
        },
        {
            icon: Award,
            label: 'Tests Completed',
            value: dashboardData?.overview?.total_tests_completed || 0,
            color: 'bg-orange-500'
        },
        {
            icon: TrendingUp,
            label: 'Avg. Score',
            value: `${dashboardData?.overview?.average_test_score || 0}%`,
            color: 'bg-purple-500'
        },
    ];

    const performanceData = dashboardData?.charts?.performance_distribution ? [
        { name: 'Excellent (>90%)', value: dashboardData.charts.performance_distribution.excellent },
        { name: 'Good (70-90%)', value: dashboardData.charts.performance_distribution.good },
        { name: 'Average (50-70%)', value: dashboardData.charts.performance_distribution.average },
        { name: 'Needs Work (<50%)', value: dashboardData.charts.performance_distribution.needs_improvement },
    ].filter(item => item.value > 0) : [];

    return (
        <div className="space-y-6 px-4 sm:px-6 lg:px-8 py-6 transition-colors">
            {/* Welcome Section */}
            <div className="bg-white dark:bg-gray-900 rounded-xl p-8 border border-gray-200 dark:border-gray-800 transition-colors">
                <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
                    Welcome back, {user?.full_name?.split(' ')[0]}! 👋
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    You're making great progress. Keep up the momentum and reach your goals today!
                </p>
            </div>

            {/* Stats Grid */}
            {loading ? (
                <div className="mb-6"><StatsCardSkeleton count={4} /></div>
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={index}
                            className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 transition-colors"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{stat.label}</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</p>
                                </div>
                                <div className={`${stat.color} p-3 rounded-lg`}>
                                    <Icon className="h-6 w-6 text-white" />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            )}

            {/* Charts Section */}
            {loading ? (
                <div className="mb-6"><WidgetSkeleton count={2} /></div>
            ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Activity Chart */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 transition-colors">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                        Learning Activity (Last 30 Days)
                    </h2>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={dashboardData?.charts?.activity || []}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    style={{ fontSize: '12px' }}
                                />
                                <YAxis style={{ fontSize: '12px' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    labelFormatter={(val) => new Date(val).toLocaleDateString()}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="count"
                                    stroke="var(--primary-600)"
                                    strokeWidth={2}
                                    dot={{ r: 3, fill: 'var(--primary-600)' }}
                                    activeDot={{ r: 5 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Performance Chart */}
                <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 transition-colors">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
                        <Award className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                        Performance Overview
                    </h2>
                    <div className="h-80 relative">
                        {performanceData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={performanceData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {performanceData.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 dark:text-gray-600">
                                <Award className="w-12 h-12 mb-2 opacity-20" />
                                <p>No test data yet</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            )}

            {/* Recent Activity & Enrolled Courses */}
            {loading ? (
                <div className="mt-8"><WidgetSkeleton count={2} /></div>
            ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity List */}
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 transition-colors">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                        Recent Activity
                    </h2>
                    <div className="space-y-4">
                        {dashboardData?.recent_activity?.length > 0 ? (
                            dashboardData.recent_activity.map((activity: any, index: number) => (
                                <div key={index} className="flex gap-3 items-start">
                                    <div className="w-2 h-2 mt-2 rounded-full bg-primary-600 dark:bg-primary-400 flex-shrink-0" />
                                    <div>
                                        <p className="text-gray-900 dark:text-gray-100 font-medium">{activity.title}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(activity.timestamp).toLocaleDateString(undefined, {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                No recent activity
                            </div>
                        )}
                    </div>
                </div>

                {/* Course Progress */}
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 transition-colors">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                        My Courses
                    </h2>
                    <div className="space-y-4">
                        {dashboardData?.enrolled_courses?.length > 0 ? (
                            dashboardData.enrolled_courses.map((course: any) => (
                                <Link
                                    key={course.course_id}
                                    to={`/courses/${course.course_id}`}
                                    className="block p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-medium text-gray-900 dark:text-gray-100">{course.title}</span>
                                        <span className="text-sm text-primary-600 dark:text-primary-400 font-semibold">
                                            {course.progress_percent}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                                        <div
                                            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${Math.min(course.progress_percent || 0, 100)}%` }}
                                        />
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-gray-500 dark:text-gray-400 mb-4">You haven't enrolled in any courses yet.</p>
                                <Link to="/courses" className="text-primary-600 dark:text-primary-400 font-medium hover:text-primary-700 dark:hover:text-primary-500">
                                    Browse Courses &rarr;
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            )}
        </div>
    );
};
