import { useState, useEffect } from 'react';
import api from '../../../lib/axios';
import { TrendingUp, Users, CheckCircle, Activity, Target, Clock, BarChart3 } from 'lucide-react';
import { PageLoader } from '../../../components/common/PageLoader';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import toast from 'react-hot-toast';
import { formatPercent } from '../../../lib/format';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

interface TrackingTabProps {
    courseId: number;
}

export const TrackingTab = ({ courseId }: TrackingTabProps) => {
    const [loading, setLoading] = useState(true);
    const [trackingData, setTrackingData] = useState<any>(null);

    useEffect(() => {
        if (courseId) {
            fetchTrackingData();
        }
    }, [courseId]);

    const fetchTrackingData = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/dashboard/admin/course/${courseId}/tracking`);
            setTrackingData(response.data);
        } catch (error) {
            console.error('Failed to fetch tracking data:', error);
            toast.error('Failed to load tracking data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <PageLoader />;
    if (!trackingData) return <div className="p-8 text-center text-gray-500 dark:text-gray-400">No tracking data available</div>;

    const progressData = Object.entries(trackingData.progress_distribution || {}).map(([range, count]) => ({
        name: range,
        value: count as number
    }));

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Course Tracking</h2>
                    <p className="text-gray-500 dark:text-gray-400">Real-time engagement and progress metrics</p>
                </div>
                <button
                    onClick={fetchTrackingData}
                    className="p-2 text-gray-400 rounded-md bg-white border border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                    <Activity className="w-5 h-5" />
                </button>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    icon={Users}
                    label="Total Enrolled"
                    value={trackingData.total_enrolled}
                    color="blue"
                />
                <MetricCard
                    icon={Activity}
                    label="Active Students"
                    value={trackingData.active_students_7d}
                    color="green"
                    subvalue={`${formatPercent(trackingData.engagement_rate)} engagement`}
                />
                <MetricCard
                    icon={CheckCircle}
                    label="Completed"
                    value={trackingData.completed_students}
                    color="emerald"
                    subvalue={`${formatPercent(trackingData.completion_rate)} completion`}
                />
                <MetricCard
                    icon={Clock}
                    label="Last 24h Activity"
                    value={trackingData.recent_activity_24h}
                    color="purple"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Progress Pie */}
                <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm transition-colors duration-300">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
                        <Target className="w-5 h-5 text-green-600 dark:text-green-400" />
                        Progress Distribution
                    </h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={progressData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {progressData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                        {progressData.map((item, index) => (
                            <div key={item.name} className="flex items-center gap-2 text-xs">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                <span className="text-gray-600">{item.name}: {item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm transition-colors duration-300">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        Engagement Breakdown
                    </h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={progressData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                <Tooltip cursor={{ fill: '#f9fafb' }} />
                                <Bar dataKey="value" fill="#6366f1" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Insights Section */}
            <div className="bg-linear-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 text-white shadow-xl shadow-indigo-200 dark:shadow-none overflow-hidden relative">
                <div className="relative z-10">
                    <h3 className="text-2xl font-bold mb-6">Engagement Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div>
                            <p className="text-indigo-100 text-sm mb-1 uppercase tracking-wider font-semibold">Average Progress</p>
                            <p className="text-4xl font-black">{formatPercent((trackingData.completion_rate + trackingData.engagement_rate) / 2)}</p>
                        </div>
                        <div>
                            <p className="text-indigo-100 text-sm mb-1 uppercase tracking-wider font-semibold">Activity Trend</p>
                            <p className="text-4xl font-black flex items-center gap-2">
                                Stable <TrendingUp className="w-8 h-8 text-green-400" />
                            </p>
                        </div>
                        <div>
                            <p className="text-indigo-100 text-sm mb-1 uppercase tracking-wider font-semibold">Completion Status</p>
                            <p className="text-4xl font-black">{trackingData.completed_students}/{trackingData.total_enrolled}</p>
                        </div>
                    </div>
                </div>
                {/* Decorative circles */}
                <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-[-20%] left-[-10%] w-64 h-64 bg-indigo-400/20 rounded-full blur-3xl"></div>
            </div>
        </div>
    );
};

const MetricCard = ({ icon: Icon, label, value, color, subvalue }: any) => {
    const colorClasses: any = {
        blue: { bg: 'bg-blue-50 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400' },
        green: { bg: 'bg-green-50 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400' },
        emerald: { bg: 'bg-emerald-50 dark:bg-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-400' },
        purple: { bg: 'bg-purple-50 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-400' },
    };

    const { bg, text } = colorClasses[color] || colorClasses.blue;

    return (
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-300">
            <div className={`p-3 w-fit rounded-xl mb-4 ${bg}`}>
                <Icon className={`w-6 h-6 ${text}`} />
            </div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</p>
            <div className="flex items-baseline gap-2">
                <h4 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{value || 0}</h4>
            </div>
            {subvalue && <p className="text-xs font-semibold text-green-600 dark:text-green-400 mt-2">{subvalue}</p>}
        </div>
    );
};
