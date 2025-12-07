import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminService } from '../../services/admin.service';
import { courseService } from '../../services/course.service';
import { Loader2, ArrowLeft, Users, Clock, BookOpen, TrendingUp, BarChart3 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import toast from 'react-hot-toast';

export const AdminCourseAnalyticsPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [analytics, setAnalytics] = useState<any>(null);
    const [course, setCourse] = useState<any>(null);

    useEffect(() => {
        if (id) {
            fetchData(parseInt(id));
        }
    }, [id]);

    const fetchData = async (courseId: number) => {
        try {
            // Fetch course details
            const courseData = await courseService.getCourse(courseId);
            setCourse(courseData);

            // Fetch analytics
            const analyticsData = await adminService.getCourseAnalytics(courseId);
            setAnalytics(analyticsData);
        } catch (error) {
            console.error('Failed to fetch course analytics:', error);
            toast.error('Failed to load course analytics');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (!course) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <h2 className="text-2xl font-bold text-gray-900">Course not found</h2>
                <button
                    onClick={() => navigate('/admin/courses')}
                    className="mt-4 text-indigo-600 hover:text-indigo-700 font-medium"
                >
                    Back to Courses
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/admin/courses')}
                        className="flex items-center text-gray-500 hover:text-gray-700 mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Back to Courses
                    </button>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Course Analytics</h1>
                            <p className="mt-1 text-gray-600">Monitoring: <span className="font-semibold">{course.title}</span></p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${course.is_published
                                ? 'bg-green-100 text-green-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                            {course.is_published ? 'Published' : 'Draft'}
                        </span>
                    </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-blue-50 rounded-lg">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">{analytics?.total_students || 0}</h3>
                        <p className="text-sm text-gray-600">Total Enrollments</p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-indigo-50 rounded-lg">
                                <Clock className="w-6 h-6 text-indigo-600" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">{analytics?.avg_completion_rate || 0}%</h3>
                        <p className="text-sm text-gray-600">Avg. Completion Rate</p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-purple-50 rounded-lg">
                                <BookOpen className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">{analytics?.total_lessons_completed || 0}</h3>
                        <p className="text-sm text-gray-600">Lessons Completed</p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-green-50 rounded-lg">
                                <TrendingUp className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">{analytics?.engagement_score || 0}/10</h3>
                        <p className="text-sm text-gray-600">Engagement Score</p>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Enrollment Trend */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-gray-500" />
                                Enrollment Trend (Last 6 Months)
                            </h3>
                        </div>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={analytics?.enrollment_trend || []}>
                                    <defs>
                                        <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Area type="monotone" dataKey="students" stroke="#4F46E5" fillOpacity={1} fill="url(#colorStudents)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Student Progress Distribution */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-gray-500" />
                                Student Progress Distribution
                            </h3>
                        </div>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={analytics?.progress_distribution || []}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="range" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
