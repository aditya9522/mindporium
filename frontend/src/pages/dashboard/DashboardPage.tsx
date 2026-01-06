import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/auth.store';
import { studentService } from '../../services/student.service';
import { BookOpen, Award, TrendingUp, Clock, Calendar } from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { Link } from 'react-router-dom';
import { PageLoader } from '../../components/common/PageLoader';

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

    if (loading) {
        return <PageLoader />;
    }

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
        <div className="space-y-8 px-8 py-8">
            {/* Welcome Section */}
            <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-10 text-white shadow-2xl shadow-indigo-200 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="absolute top-0 right-0 p-12 opacity-10 transform translate-x-12 -translate-y-12">
                    <Award className="w-56 h-56 text-white" />
                </div>
                <div className="relative z-10">
                    <h1 className="text-4xl font-extrabold mb-3 tracking-tight">
                        Welcome back, {user?.full_name?.split(' ')[0]}! 👋
                    </h1>
                    <p className="text-indigo-100 text-lg font-medium opacity-90 max-w-xl">
                        You're making great progress. Keep up the momentum and reach your goals today!
                    </p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={index}
                            className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-[0_2px_15px_rgb(0,0,0,0.04)] border border-gray-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 transform hover:-translate-y-1"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-1">{stat.label}</p>
                                    <p className="text-3xl font-extrabold text-gray-900 tracking-tight">{stat.value}</p>
                                </div>
                                <div className={`${stat.color} p-3.5 rounded-xl shadow-lg shadow-indigo-100/50`}>
                                    <Icon className="h-6 w-6 text-white" />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Activity Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-indigo-600" />
                        Learning Activity (Last 30 Days)
                    </h2>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={dashboardData?.charts?.activity || []}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
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
                                    stroke="#4F46E5"
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: '#4F46E5' }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Performance Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Award className="w-5 h-5 text-indigo-600" />
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
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                                <Award className="w-12 h-12 mb-2 opacity-20" />
                                <p>No test data yet</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Recent Activity & Enrolled Courses */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Activity List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-indigo-600" />
                        Recent Activity
                    </h2>
                    <div className="space-y-6">
                        {dashboardData?.recent_activity?.length > 0 ? (
                            dashboardData.recent_activity.map((activity: any, index: number) => (
                                <div key={index} className="flex gap-4 items-start">
                                    <div className="w-2 h-2 mt-2 rounded-full bg-indigo-600 flex-shrink-0" />
                                    <div>
                                        <p className="text-gray-900 font-medium">{activity.title}</p>
                                        <p className="text-sm text-gray-500">
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
                            <div className="text-center py-8 text-gray-500">
                                No recent activity
                            </div>
                        )}
                    </div>
                </div>

                {/* Course Progress */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-indigo-600" />
                        My Courses
                    </h2>
                    <div className="space-y-4">
                        {dashboardData?.enrolled_courses?.length > 0 ? (
                            dashboardData.enrolled_courses.map((course: any) => (
                                <Link
                                    key={course.course_id}
                                    to={`/courses/${course.course_id}`}
                                    className="block p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-medium text-gray-900">{course.title}</span>
                                        <span className="text-sm text-indigo-600 font-semibold">
                                            {course.progress_percent}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${course.progress_percent}%` }}
                                        />
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-gray-500 mb-4">You haven't enrolled in any courses yet.</p>
                                <Link to="/courses" className="text-indigo-600 font-medium hover:text-indigo-700">
                                    Browse Courses &rarr;
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
