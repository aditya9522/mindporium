import { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service';
import { Users, BookOpen, Monitor, DollarSign, GraduationCap, Activity } from 'lucide-react';
import { StatsCardSkeleton } from '../../components/ui/StatsCardSkeleton';
import { WidgetSkeleton } from '../../components/ui/WidgetSkeleton';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

import api from '../../lib/axios';

export const AdminDashboardPage = () => {
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState<any>(null);

    const [systemHealth, setSystemHealth] = useState({
        status: 'checking',
        dbStatus: 'unknown',
        responseTime: 0,
        lastUpdated: new Date()
    });

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        const startTime = performance.now();
        try {
            // Run in parallel
            const [data, healthRes] = await Promise.all([
                adminService.getDashboardOverview(),
                api.get('/health').catch(() => ({ data: { status: 'down', database: 'disconnected' } }))
            ]);
            
            setDashboardData(data);
            
            const isHealthy = healthRes.data?.status === 'healthy';
            setSystemHealth({
                status: isHealthy ? 'operational' : 'degraded',
                dbStatus: healthRes.data?.database === 'connected' ? 'healthy' : 'disconnected',
                responseTime: Math.round(performance.now() - startTime),
                lastUpdated: new Date()
            });
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
            setSystemHealth({
                status: 'degraded',
                dbStatus: 'unknown',
                responseTime: Math.round(performance.now() - startTime),
                lastUpdated: new Date()
            });
        } finally {
            setLoading(false);
        }
    };



    const overview = dashboardData?.overview || {};
    const topCourses = dashboardData?.top_courses || [];

    // Prepare chart data
    const activeStudents = overview.active_students || 0;
    const activeInstructors = overview.active_instructors || 0;
    
    // Only show user distribution pie chart data if there's actual data,
    // otherwise Recharts looks weird with all 0s.
    const userDistribution = (activeStudents > 0 || activeInstructors > 0) ? [
        { name: 'Students', value: activeStudents },
        { name: 'Instructors', value: activeInstructors },
    ] : [];

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
        <div className="space-y-8 px-4 py-6 transition-colors sm:px-6 lg:px-8">
            <div className="contents">
                <section className="mb-8 overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-[0_2px_15px_rgb(0,0,0,0.04)] dark:border-gray-800 dark:bg-gray-900">
                    <div className="grid gap-0 lg:grid-cols-[1fr_380px]">
                        <div className="p-8">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-black uppercase tracking-wide text-primary-700 dark:bg-primary-950 dark:text-primary-300">Admin Overview</span>
                                <span className={`rounded-full px-3 py-1 text-xs font-bold ${systemHealth.status === 'operational' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300' : 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300'}`}>
                                    {systemHealth.status === 'operational' ? 'Operational' : 'Needs Attention'}
                                </span>
                            </div>
                            <h1 className="mt-4 text-4xl font-black tracking-tight text-gray-950 dark:text-white">Platform command room</h1>
                            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500 dark:text-gray-400">A clear view of users, courses, enrollments, revenue, live classrooms, and system health.</p>
                        </div>
                        <div className="border-t border-gray-100 bg-gray-50 p-8 dark:border-gray-800 dark:bg-gray-950/50 lg:border-l lg:border-t-0">
                            <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Platform Scale</p>
                            <p className="mt-4 text-4xl font-black text-gray-950 dark:text-white">{overview.total_users || 0}</p>
                            <p className="mt-1 text-sm font-semibold text-gray-500">registered users across the platform</p>
                        </div>
                    </div>
                </section>

                {/* Stats Grid */}
                {loading ? (
                    <div className="mb-8"><StatsCardSkeleton count={6} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" /></div>
                ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {statsCards.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <div key={index} className="bg-white dark:bg-gray-900/80 backdrop-blur-sm rounded-3xl shadow-[0_2px_15px_rgb(0,0,0,0.04)] dark:shadow-none border border-gray-100 dark:border-gray-800 p-8 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:hover:shadow-indigo-900/10 transition-all duration-300 transform hover:-translate-y-1 group">
                                <div className="flex items-center justify-between mb-6">
                                    <div className={`w-14 h-14 ${stat.color} rounded-2xl shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                        <Icon className="w-7 h-7 text-white" />
                                    </div>
                                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg ${stat.changeType === 'positive' ? 'text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800' :
                                        stat.changeType === 'negative' ? 'text-red-700 bg-red-50 dark:bg-red-900/20 dark:text-red-400 border border-red-100 dark:border-red-800' :
                                            'text-gray-600 bg-gray-50 dark:bg-gray-800/30 dark:text-gray-400 border border-gray-100 dark:border-gray-700'
                                        }`}>
                                        {stat.change}
                                    </span>
                                </div>
                                <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-1 tracking-tight">{stat.value}</h3>
                                <p className="text-sm text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest">{stat.title}</p>
                            </div>
                        );
                    })}
                </div>
                )}

                {/* Charts Section */}
                {loading ? (
                    <div className="mb-8"><WidgetSkeleton count={2} /></div>
                ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* User Distribution Pie Chart */}
                    <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
                        <h2 className="text-sm font-black text-gray-900 dark:text-white mb-6 uppercase tracking-widest">User Distribution</h2>
                        <div className="h-[300px] relative">
                            {userDistribution.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={userDistribution}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                                            outerRadius={100}
                                            innerRadius={60}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {userDistribution.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '12px', color: '#fff' }}
                                            itemStyle={{ color: '#fff' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 dark:text-gray-600">
                                    <Users className="w-12 h-12 mb-2 opacity-20" />
                                    <p>No distribution data</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Top Courses Bar Chart */}
                    <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
                        <h2 className="text-sm font-black text-gray-900 dark:text-white mb-6 uppercase tracking-widest">Top Courses</h2>
                        <div className="h-[300px] relative">
                            {topCourses.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={topCourses}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.1} />
                                        <XAxis
                                            dataKey="title"
                                            angle={-45}
                                            textAnchor="end"
                                            height={80}
                                            stroke="#9ca3af"
                                            fontSize={10}
                                            fontWeight="bold"
                                        />
                                        <YAxis stroke="#9ca3af" fontSize={10} fontWeight="bold" />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '12px', color: '#fff' }}
                                            itemStyle={{ color: '#fff' }}
                                        />
                                        <Bar dataKey="enrollments" fill="#6366f1" radius={[6, 6, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 dark:text-gray-600">
                                    <BookOpen className="w-12 h-12 mb-2 opacity-20" />
                                    <p>No enrollment data</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                )}

                {/* Platform Activity */}
                {loading ? (
                    <div className="mb-8"><StatsCardSkeleton count={3} className="grid grid-cols-1 md:grid-cols-3 gap-6" /></div>
                ) : (
                <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 mb-8">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                            <Activity className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Platform Activity</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-6 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 group hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all">
                            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-black uppercase tracking-widest mb-2">New Enrollments (7d)</p>
                            <p className="text-3xl font-black text-indigo-900 dark:text-indigo-100">
                                {dashboardData?.recent_activity?.enrollments_last_7_days || 0}
                            </p>
                        </div>
                        <div className="p-6 bg-purple-50/50 dark:bg-purple-900/10 rounded-2xl border border-purple-100 dark:border-purple-900/30 group hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all">
                            <p className="text-xs text-purple-600 dark:text-purple-400 font-black uppercase tracking-widest mb-2">Active Instructors</p>
                            <p className="text-3xl font-black text-purple-900 dark:text-purple-100">{overview.active_instructors || 0}</p>
                        </div>
                        <div className="p-6 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 group hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all">
                            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-widest mb-2">Live Classes Now</p>
                            <p className="text-3xl font-black text-emerald-900 dark:text-emerald-100">{overview.live_classes || 0}</p>
                        </div>
                    </div>
                </div>
                )}

                {/* System Health */}
                {loading ? (
                    <StatsCardSkeleton count={3} className="grid grid-cols-1 md:grid-cols-3 gap-6" />
                ) : (
                <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
                    <h2 className="text-xl font-black text-gray-900 dark:text-white mb-8 tracking-tight">System Health</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className={`p-6 rounded-2xl border transition-all ${systemHealth.status === 'operational'
                            ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30'
                            : 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30'
                            }`}>
                            <div className="flex items-center gap-3 mb-3">
                                <div className={`w-2.5 h-2.5 rounded-full ${systemHealth.status === 'operational' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
                                    }`}></div>
                                <span className="text-xs font-black uppercase tracking-widest text-gray-900 dark:text-white">Status</span>
                            </div>
                            <p className={`text-lg font-bold ${systemHealth.status === 'operational' ? 'text-emerald-900 dark:text-emerald-400' : 'text-red-900 dark:text-red-400'
                                }`}>
                                {systemHealth.status === 'operational' ? 'Operational' : 'Issues Detected'}
                            </p>
                            <p className="text-[10px] text-gray-400 font-bold mt-2">Updated {systemHealth.lastUpdated.toLocaleTimeString()}</p>
                        </div>

                        <div className="p-6 bg-gray-50 dark:bg-gray-800/20 rounded-2xl border border-gray-100 dark:border-gray-700/50">
                            <div className="flex items-center gap-3 mb-3">
                                <div className={`w-2.5 h-2.5 rounded-full ${systemHealth.dbStatus === 'healthy' ? 'bg-blue-500' : 'bg-amber-500'
                                    }`}></div>
                                <span className="text-xs font-black uppercase tracking-widest text-gray-900 dark:text-white">Database</span>
                            </div>
                            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                {systemHealth.dbStatus === 'healthy' ? 'Healthy' : 'Unknown'}
                            </p>
                        </div>

                        <div className="p-6 bg-gray-50 dark:bg-gray-800/20 rounded-2xl border border-gray-100 dark:border-gray-700/50">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full"></div>
                                <span className="text-xs font-black uppercase tracking-widest text-gray-900 dark:text-white">API Latency</span>
                            </div>
                            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                {systemHealth.responseTime > 0 ? `${systemHealth.responseTime}ms` : 'Measuring...'}
                            </p>
                        </div>
                    </div>
                </div>
                )}
            </div>
        </div>
    );
};
