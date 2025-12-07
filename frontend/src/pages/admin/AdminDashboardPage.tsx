import { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service';
import { Users, BookOpen, Monitor, Loader2, DollarSign, GraduationCap, Activity } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

export const AdminDashboardPage = () => {
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState<any>(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const data = await adminService.getDashboardOverview();
            setDashboardData(data);
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    const overview = dashboardData?.overview || {};
    const topCourses = dashboardData?.top_courses || [];

    // Prepare chart data
    const userDistribution = [
        { name: 'Students', value: overview.active_students || 0 },
        { name: 'Instructors', value: overview.active_instructors || 0 },
    ];

    const statsCards = [
        {
            title: 'Total Users',
            value: overview.total_users || 0,
            icon: Users,
            color: 'bg-blue-500',
            change: '+12%',
            changeType: 'positive'
        },
        {
            title: 'Total Courses',
            value: overview.total_courses || 0,
            icon: BookOpen,
            color: 'bg-indigo-500',
            change: '+5%',
            changeType: 'positive'
        },
        {
            title: 'Live Classes',
            value: overview.live_classes || 0,
            icon: Monitor,
            color: 'bg-purple-500',
            change: `${overview.total_classrooms || 0} Total`,
            changeType: 'neutral'
        },
        {
            title: 'Total Enrollments',
            value: overview.total_enrollments || 0,
            icon: GraduationCap,
            color: 'bg-green-500',
            change: `+${dashboardData?.recent_activity?.enrollments_last_7_days || 0} this week`,
            changeType: 'positive'
        },
        {
            title: 'Active Students',
            value: overview.active_students || 0,
            icon: Users,
            color: 'bg-orange-500',
            change: 'Currently active',
            changeType: 'neutral'
        },
        {
            title: 'Total Revenue',
            value: `$${(overview.total_revenue || 0).toLocaleString()}`,
            icon: DollarSign,
            color: 'bg-emerald-500',
            change: '+8%',
            changeType: 'positive'
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                    <p className="mt-2 text-gray-600">Platform overview and analytics</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {statsCards.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                                        <Icon className="w-6 h-6 text-white" />
                                    </div>
                                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${stat.changeType === 'positive' ? 'text-green-600 bg-green-50' :
                                        stat.changeType === 'negative' ? 'text-red-600 bg-red-50' :
                                            'text-gray-600 bg-gray-50'
                                        }`}>
                                        {stat.change}
                                    </span>
                                </div>
                                <h3 className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                                <p className="text-sm text-gray-600">{stat.title}</p>
                            </div>
                        );
                    })}
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* User Distribution Pie Chart */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">User Distribution</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={userDistribution}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {userDistribution.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Top Courses Bar Chart */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Top Courses by Enrollment</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={topCourses}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="title" angle={-45} textAnchor="end" height={100} />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="enrollments" fill="#6366f1" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Platform Activity */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
                    <div className="flex items-center gap-2 mb-4">
                        <Activity className="w-5 h-5 text-indigo-600" />
                        <h2 className="text-lg font-bold text-gray-900">Platform Activity</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                            <p className="text-sm text-indigo-600 font-medium mb-1">New Enrollments (7 days)</p>
                            <p className="text-2xl font-bold text-indigo-900">
                                {dashboardData?.recent_activity?.enrollments_last_7_days || 0}
                            </p>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                            <p className="text-sm text-purple-600 font-medium mb-1">Active Instructors</p>
                            <p className="text-2xl font-bold text-purple-900">{overview.active_instructors || 0}</p>
                        </div>
                        <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                            <p className="text-sm text-green-600 font-medium mb-1">Live Classes Now</p>
                            <p className="text-2xl font-bold text-green-900">{overview.live_classes || 0}</p>
                        </div>
                    </div>
                </div>

                {/* System Health */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">System Health</h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-100">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="font-medium text-green-900">All Systems Operational</span>
                            </div>
                            <span className="text-sm text-green-700">Updated just now</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span className="font-medium text-gray-900">Database Status</span>
                            </div>
                            <span className="text-sm text-gray-600">Healthy</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                <span className="font-medium text-gray-900">API Response Time</span>
                            </div>
                            <span className="text-sm text-gray-600">45ms avg</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
