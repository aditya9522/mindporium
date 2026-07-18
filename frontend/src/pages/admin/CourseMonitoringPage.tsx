import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminService } from '../../services/admin.service';
import { ArrowLeft, Activity, Users, Clock, CheckCircle, TrendingUp, Calendar } from 'lucide-react';
import { PageLoader } from '../../components/common/PageLoader';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

export const CourseMonitoringPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [monitoringData, setMonitoringData] = useState<any>(null);

    useEffect(() => {
        if (id) {
            fetchMonitoringData(parseInt(id));
        }
    }, [id]);

    const fetchMonitoringData = async (courseId: number) => {
        try {
            const data = await adminService.getCourseAnalytics(courseId);
            setMonitoringData(data);
        } catch (error) {
            console.error('Failed to fetch monitoring data:', error);
            toast.error('Failed to load monitoring data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <PageLoader />;
    }

    if (!monitoringData) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
                <div className="max-w-7xl mx-auto px-4">
                    <p className="text-center text-gray-600 dark:text-gray-400">No monitoring data available</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <button
                    onClick={() => navigate('/admin/courses')}
                    className="flex items-center text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Courses
                </button>

                <div className="mb-8">
                    <h1 className="text-3xl font-bold bg-linear-to-r from-indigo-600 to-blue-600 dark:from-indigo-400 dark:to-blue-400 bg-clip-text text-transparent">
                        Course Monitoring
                    </h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">Real-time classroom and session monitoring</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                                <Activity className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                            </div>
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{monitoringData.total_classes || 0}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total Classes</p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
                                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                            </div>
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{monitoringData.completed_classes || 0}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Completed</p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-red-50 dark:bg-red-900/30 rounded-lg">
                                <Clock className="w-6 h-6 text-red-600 dark:text-red-400" />
                            </div>
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{monitoringData.live_classes || 0}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Live Now</p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                                <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                            </div>
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{monitoringData.upcoming_classes || 0}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Upcoming</p>
                    </div>
                </div>

                {/* Classroom Details */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mb-8">
                    <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Activity className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            Classroom Sessions
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Session
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Attendance
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Late Count
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Start Time
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {monitoringData.classroom_details?.map((classroom: any, index: number) => (
                                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900 dark:text-white">{classroom.title}</div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">ID: {classroom.classroom_id}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${classroom.status === 'completed'
                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                : classroom.status === 'live'
                                                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                    : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                                }`}>
                                                {classroom.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Users className="w-4 h-4 text-gray-400" />
                                                <span className="font-semibold text-gray-900 dark:text-white">{classroom.total_attendance || 0}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-gray-900 dark:text-white">{classroom.late_count || 0}</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                            {classroom.start_time ? new Date(classroom.start_time).toLocaleString() : 'TBD'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {(!monitoringData.classroom_details || monitoringData.classroom_details.length === 0) && (
                        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                            <Activity className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                            <p>No classroom sessions found</p>
                        </div>
                    )}
                </div>

                {/* Attendance Chart */}
                {monitoringData.classroom_details && monitoringData.classroom_details.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            Attendance Overview
                        </h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={monitoringData.classroom_details}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" />
                                <XAxis dataKey="title" angle={-45} textAnchor="end" height={100} stroke="#9CA3AF" />
                                <YAxis stroke="#9CA3AF" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1F2937',
                                        borderColor: '#374151',
                                        color: '#F9FAFB'
                                    }}
                                />
                                <Bar dataKey="total_attendance" fill="#6366f1" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </div>
    );
};
