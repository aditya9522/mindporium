import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../lib/axios';
import { Loader2, ArrowLeft, TrendingUp, Users, CheckCircle, Activity, Target, Clock } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import toast from 'react-hot-toast';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

export const CourseTrackingPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [trackingData, setTrackingData] = useState<any>(null);

    useEffect(() => {
        if (id) {
            fetchTrackingData(parseInt(id));
        }
    }, [id]);

    const fetchTrackingData = async (courseId: number) => {
        try {
            const response = await api.get(`/dashboard/admin/course/${courseId}/tracking`);
            setTrackingData(response.data);
        } catch (error) {
            console.error('Failed to fetch tracking data:', error);
            toast.error('Failed to load tracking data');
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

    if (!trackingData) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4">
                    <p className="text-center text-gray-600">No tracking data available</p>
                </div>
            </div>
        );
    }

    // Prepare progress distribution data for pie chart
    const progressData = Object.entries(trackingData.progress_distribution || {}).map(([range, count]) => ({
        name: range,
        value: count as number
    }));

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50/30 to-emerald-50/30 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <button
                    onClick={() => navigate('/admin/courses')}
                    className="flex items-center text-gray-500 hover:text-gray-900 mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Courses
                </button>

                <div className="mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                        Course Progress Tracking
                    </h1>
                    <p className="mt-2 text-gray-600">{trackingData.course_title}</p>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-blue-50 rounded-lg">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                            <TrendingUp className="w-5 h-5 text-green-500" />
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900">{trackingData.total_enrolled || 0}</h3>
                        <p className="text-sm text-gray-600 mt-1">Total Enrolled</p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-green-50 rounded-lg">
                                <Activity className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900">{trackingData.active_students_7d || 0}</h3>
                        <p className="text-sm text-gray-600 mt-1">Active (7 days)</p>
                        <p className="text-xs text-green-600 mt-2">{trackingData.engagement_rate}% engagement</p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-emerald-50 rounded-lg">
                                <CheckCircle className="w-6 h-6 text-emerald-600" />
                            </div>
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900">{trackingData.completed_students || 0}</h3>
                        <p className="text-sm text-gray-600 mt-1">Completed</p>
                        <p className="text-xs text-emerald-600 mt-2">{trackingData.completion_rate}% completion</p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-purple-50 rounded-lg">
                                <Clock className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900">{trackingData.recent_activity_24h || 0}</h3>
                        <p className="text-sm text-gray-600 mt-1">Activity (24h)</p>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Progress Distribution Pie Chart */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Target className="w-5 h-5 text-green-600" />
                            Progress Distribution
                        </h2>
                        {progressData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={progressData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {progressData.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[300px] flex items-center justify-center text-gray-500">
                                No progress data available
                            </div>
                        )}
                    </div>

                    {/* Progress Bar Chart */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-indigo-600" />
                            Student Progress Breakdown
                        </h2>
                        {progressData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={progressData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[300px] flex items-center justify-center text-gray-500">
                                No progress data available
                            </div>
                        )}
                    </div>
                </div>

                {/* Engagement Insights */}
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-xl p-8 text-white">
                    <h2 className="text-2xl font-bold mb-6">Engagement Insights</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <TrendingUp className="w-5 h-5" />
                                </div>
                                <h3 className="font-bold">Engagement Rate</h3>
                            </div>
                            <p className="text-3xl font-bold">{trackingData.engagement_rate}%</p>
                            <p className="text-sm text-indigo-100 mt-2">
                                {trackingData.active_students_7d} of {trackingData.total_enrolled} students active
                            </p>
                        </div>

                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <CheckCircle className="w-5 h-5" />
                                </div>
                                <h3 className="font-bold">Completion Rate</h3>
                            </div>
                            <p className="text-3xl font-bold">{trackingData.completion_rate}%</p>
                            <p className="text-sm text-indigo-100 mt-2">
                                {trackingData.completed_students} students completed
                            </p>
                        </div>

                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <Activity className="w-5 h-5" />
                                </div>
                                <h3 className="font-bold">Recent Activity</h3>
                            </div>
                            <p className="text-3xl font-bold">{trackingData.recent_activity_24h}</p>
                            <p className="text-sm text-indigo-100 mt-2">
                                Activities in last 24 hours
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
