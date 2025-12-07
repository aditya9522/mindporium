import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { instructorService } from '../../services/instructor.service';
import type { CourseOverview } from '../../types/instructor';
import { ArrowLeft, Users, BookOpen, TrendingUp, Star, Loader2, Calendar, Award } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export const CourseAnalyticsPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<CourseOverview | null>(null);

    useEffect(() => {
        if (id) {
            fetchAnalytics();
        }
    }, [id]);

    const fetchAnalytics = async () => {
        try {
            const overview = await instructorService.getCourseOverview(Number(id));
            setData(overview);
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
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

    if (!data) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-500">Failed to load analytics</p>
            </div>
        );
    }

    // Prepare chart data
    const subjectData = data.subjects.map(subject => ({
        name: subject.title.length > 20 ? subject.title.substring(0, 20) + '...' : subject.title,
        classes: subject.total_classes,
    }));

    const engagementData = [
        { name: 'Active', value: data.statistics.active_students },
        { name: 'Inactive', value: data.statistics.total_enrollments - data.statistics.active_students },
    ];

    const COLORS = ['#4F46E5', '#E5E7EB'];

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/instructor/courses')}
                        className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to My Courses
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{data.course.title}</h1>
                        <p className="mt-2 text-gray-600">Course Analytics & Performance</p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-2">
                            <Users className="w-8 h-8 text-blue-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">{data.statistics.total_enrollments}</h3>
                        <p className="text-sm text-gray-600">Total Enrollments</p>
                        <p className="text-xs text-green-600 mt-1">
                            +{data.statistics.recent_enrollments_7d} this week
                        </p>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-2">
                            <TrendingUp className="w-8 h-8 text-green-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">{data.statistics.active_students}</h3>
                        <p className="text-sm text-gray-600">Active Students</p>
                        <p className="text-xs text-gray-500 mt-1">
                            {data.engagement.active_student_rate}% engagement
                        </p>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-2">
                            <Award className="w-8 h-8 text-purple-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">{data.statistics.completion_rate}%</h3>
                        <p className="text-sm text-gray-600">Completion Rate</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-2">
                            <Star className="w-8 h-8 text-yellow-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">{data.statistics.average_rating}</h3>
                        <p className="text-sm text-gray-600">Average Rating</p>
                        <p className="text-xs text-gray-500 mt-1">
                            {data.statistics.total_feedback} reviews
                        </p>
                    </div>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Subject Classes Chart */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Classes per Subject</h2>
                        {subjectData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={subjectData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="classes" fill="#4F46E5" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[300px] flex items-center justify-center text-gray-500">
                                No subjects yet
                            </div>
                        )}
                    </div>

                    {/* Student Engagement Chart */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Student Engagement</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={engagementData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, value }) => `${name}: ${value}`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {engagementData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Course Details */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Course Info */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Course Information</h2>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Level:</span>
                                <span className="font-medium text-gray-900 capitalize">{data.course.level}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Category:</span>
                                <span className="font-medium text-gray-900 capitalize">{data.course.category}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Status:</span>
                                <span className={`font-medium ${data.course.is_published ? 'text-green-600' : 'text-yellow-600'}`}>
                                    {data.course.is_published ? 'Published' : 'Draft'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Total Subjects:</span>
                                <span className="font-medium text-gray-900">{data.statistics.total_subjects}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Total Classes:</span>
                                <span className="font-medium text-gray-900">{data.statistics.total_classes}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Total Tests:</span>
                                <span className="font-medium text-gray-900">{data.statistics.total_tests}</span>
                            </div>
                        </div>
                    </div>

                    {/* Subjects List */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Subjects ({data.subjects.length})</h2>
                        <div className="space-y-2 max-h-[300px] overflow-y-auto">
                            {data.subjects.map((subject) => (
                                <div key={subject.subject_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <BookOpen className="w-4 h-4 text-gray-600" />
                                        <span className="text-sm font-medium text-gray-900">{subject.title}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <Calendar className="w-3 h-3" />
                                        <span>{subject.total_classes} classes</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
