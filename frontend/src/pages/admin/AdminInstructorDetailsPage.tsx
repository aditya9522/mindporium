import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminService } from '../../services/admin.service';
import { Loader2, ArrowLeft, Users, BookOpen, DollarSign, TrendingUp, Clock, Award, Calendar, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

export const AdminInstructorDetailsPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState<any>(null);
    const [instructor, setInstructor] = useState<any>(null);

    useEffect(() => {
        if (id) {
            fetchData(parseInt(id));
        }
    }, [id]);

    const fetchData = async (instructorId: number) => {
        try {
            const users = await adminService.getInstructors();
            const currentInstructor = users.find((u: any) => u.id === instructorId);
            setInstructor(currentInstructor);

            const dashboard = await adminService.getInstructorDashboard(instructorId);
            setDashboardData(dashboard);
        } catch (error) {
            console.error('Failed to fetch instructor details:', error);
            toast.error('Failed to load instructor data');
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

    if (!instructor) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
                <h2 className="text-2xl font-bold text-gray-900">Instructor not found</h2>
                <button
                    onClick={() => navigate('/admin/instructors')}
                    className="mt-4 text-indigo-600 hover:text-indigo-700 font-medium"
                >
                    Back to Instructors
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <button
                    onClick={() => navigate('/admin/instructors')}
                    className="flex items-center text-gray-500 hover:text-gray-700 mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back to Instructors
                </button>

                {/* Instructor Profile Card */}
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-xl p-8 mb-8 text-white">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-6">
                            <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-4xl font-bold border-4 border-white/30">
                                {instructor.full_name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold mb-2">{instructor.full_name}</h1>
                                <p className="text-indigo-100 mb-1">{instructor.email}</p>
                                <p className="text-sm text-indigo-200">
                                    Joined {instructor.created_at ? formatDistanceToNow(new Date(instructor.created_at), { addSuffix: true }) : 'recently'}
                                </p>
                            </div>
                        </div>
                        <span className={`px-4 py-2 rounded-full text-sm font-semibold ${instructor.is_active
                            ? 'bg-green-500/20 text-green-100 border border-green-300/30'
                            : 'bg-red-500/20 text-red-100 border border-red-300/30'
                            }`}>
                            {instructor.is_active ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-indigo-50 rounded-lg">
                                <BookOpen className="w-6 h-6 text-indigo-600" />
                            </div>
                            <TrendingUp className="w-5 h-5 text-green-500" />
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900">{dashboardData?.total_courses || 0}</h3>
                        <p className="text-sm text-gray-600 mt-1">Total Courses</p>
                        <p className="text-xs text-green-600 mt-2">{dashboardData?.active_courses || 0} active</p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-blue-50 rounded-lg">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                            <TrendingUp className="w-5 h-5 text-green-500" />
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900">{dashboardData?.total_students || 0}</h3>
                        <p className="text-sm text-gray-600 mt-1">Total Students</p>
                        <p className="text-xs text-gray-500 mt-2">Across all courses</p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-emerald-50 rounded-lg">
                                <DollarSign className="w-6 h-6 text-emerald-600" />
                            </div>
                            <TrendingUp className="w-5 h-5 text-green-500" />
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900">${(dashboardData?.total_revenue || 0).toLocaleString()}</h3>
                        <p className="text-sm text-gray-600 mt-1">Total Revenue</p>
                        <p className="text-xs text-gray-500 mt-2">Generated revenue</p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-purple-50 rounded-lg">
                                <Award className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900">{dashboardData?.upcoming_classes?.length || 0}</h3>
                        <p className="text-sm text-gray-600 mt-1">Upcoming Classes</p>
                        <p className="text-xs text-gray-500 mt-2">Scheduled sessions</p>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Course Stats */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-indigo-600" />
                                Course Enrollment
                            </h3>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={dashboardData?.course_stats || []}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="course_title" angle={-45} textAnchor="end" height={100} />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="total_enrollments" fill="#6366f1" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Course Completion Rate */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-green-600" />
                                Completion Rates
                            </h3>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={dashboardData?.course_stats?.map((course: any) => ({
                                        name: course.course_title,
                                        value: course.completion_rate || 0
                                    })) || []}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {dashboardData?.course_stats?.map((_: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Enrollments */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
                    <div className="p-6 border-b border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-gray-500" />
                            Recent Enrollments
                        </h3>
                    </div>
                    <div className="p-6">
                        {dashboardData?.recent_enrollments?.length > 0 ? (
                            <div className="space-y-4">
                                {dashboardData.recent_enrollments.slice(0, 5).map((enrollment: any, index: number) => (
                                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                                                {enrollment.user_name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{enrollment.user_name}</p>
                                                <p className="text-sm text-gray-500">{enrollment.course_title}</p>
                                            </div>
                                        </div>
                                        <span className="text-xs text-gray-400">
                                            {enrollment.enrolled_at ? formatDistanceToNow(new Date(enrollment.enrolled_at), { addSuffix: true }) : 'Recently'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-gray-500 py-8">No recent enrollments</p>
                        )}
                    </div>
                </div>

                {/* Upcoming Classes */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="p-6 border-b border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-gray-500" />
                            Upcoming Classes
                        </h3>
                    </div>
                    <div className="p-6">
                        {dashboardData?.upcoming_classes?.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {dashboardData.upcoming_classes.slice(0, 6).map((classItem: any, index: number) => (
                                    <div key={index} className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:shadow-sm transition-all">
                                        <h4 className="font-semibold text-gray-900 mb-1">{classItem.title}</h4>
                                        <p className="text-sm text-gray-600 mb-2">{classItem.subject_title}</p>
                                        <div className="flex items-center justify-between text-xs text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {classItem.start_time ? new Date(classItem.start_time).toLocaleString() : 'TBD'}
                                            </span>
                                            <span className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-full font-medium">
                                                {classItem.class_type}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-gray-500 py-8">No upcoming classes scheduled</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
