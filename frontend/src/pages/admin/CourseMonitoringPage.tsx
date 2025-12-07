import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminService } from '../../services/admin.service';
import { Loader2, ArrowLeft, Activity, Users, Clock, CheckCircle, TrendingUp, Calendar } from 'lucide-react';
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
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (!monitoringData) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4">
                    <p className="text-center text-gray-600">No monitoring data available</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 py-8">
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
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                        Course Monitoring
                    </h1>
                    <p className="mt-2 text-gray-600">Real-time classroom and session monitoring</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-indigo-50 rounded-lg">
                                <Activity className="w-6 h-6 text-indigo-600" />
                            </div>
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900">{monitoringData.total_classes || 0}</h3>
                        <p className="text-sm text-gray-600 mt-1">Total Classes</p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-green-50 rounded-lg">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900">{monitoringData.completed_classes || 0}</h3>
                        <p className="text-sm text-gray-600 mt-1">Completed</p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-red-50 rounded-lg">
                                <Clock className="w-6 h-6 text-red-600" />
                            </div>
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900">{monitoringData.live_classes || 0}</h3>
                        <p className="text-sm text-gray-600 mt-1">Live Now</p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-purple-50 rounded-lg">
                                <Calendar className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900">{monitoringData.upcoming_classes || 0}</h3>
                        <p className="text-sm text-gray-600 mt-1">Upcoming</p>
                    </div>
                </div>

                {/* Classroom Details */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-indigo-600" />
                            Classroom Sessions
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Session
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Attendance
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Late Count
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Start Time
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {monitoringData.classroom_details?.map((classroom: any, index: number) => (
                                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{classroom.title}</div>
                                            <div className="text-sm text-gray-500">ID: {classroom.classroom_id}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${classroom.status === 'completed'
                                                ? 'bg-green-100 text-green-700'
                                                : classroom.status === 'live'
                                                    ? 'bg-red-100 text-red-700'
                                                    : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                {classroom.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Users className="w-4 h-4 text-gray-400" />
                                                <span className="font-semibold text-gray-900">{classroom.total_attendance || 0}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-gray-900">{classroom.late_count || 0}</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {classroom.start_time ? new Date(classroom.start_time).toLocaleString() : 'TBD'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {(!monitoringData.classroom_details || monitoringData.classroom_details.length === 0) && (
                        <div className="text-center py-12 text-gray-500">
                            <Activity className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                            <p>No classroom sessions found</p>
                        </div>
                    )}
                </div>

                {/* Attendance Chart */}
                {monitoringData.classroom_details && monitoringData.classroom_details.length > 0 && (
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-indigo-600" />
                            Attendance Overview
                        </h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={monitoringData.classroom_details}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="title" angle={-45} textAnchor="end" height={100} />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="total_attendance" fill="#6366f1" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </div>
    );
};
