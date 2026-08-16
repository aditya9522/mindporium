import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { instructorService } from '../../services/instructor.service';
import type { CourseOverview } from '../../types/instructor';
import { ArrowLeft, Users, BookOpen, TrendingUp, Star, Calendar, Award } from 'lucide-react';
import { PageLoader } from '../../components/common/PageLoader';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatNumber, formatPercent } from '../../lib/format';

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
        return <PageLoader />;
    }

    if (!data) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500">Failed to load analytics</p>
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
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/instructor/courses')}
                        className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to My Courses
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{data.course.title}</h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">Course Analytics & Performance</p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                            <Users className="w-8 h-8 text-blue-600 dark:text-blue-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{data.statistics.total_enrollments}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Total Enrollments</p>
                        <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                            +{data.statistics.recent_enrollments_7d} this week
                        </p>
                    </div>

                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                            <TrendingUp className="w-8 h-8 text-green-600 dark:text-green-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{data.statistics.active_students}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Active Students</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            {formatPercent(data.engagement.active_student_rate)} engagement
                        </p>
                    </div>

                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                            <Award className="w-8 h-8 text-purple-600 dark:text-purple-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{formatPercent(data.statistics.completion_rate)}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Completion Rate</p>
                    </div>

                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                            <Star className="w-8 h-8 text-yellow-600 dark:text-yellow-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(data.statistics.average_rating)}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Average Rating</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            {data.statistics.total_feedback} reviews
                        </p>
                    </div>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Subject Classes Chart */}
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 transition-colors">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Classes per Subject</h2>
                        {subjectData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={subjectData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-gray-200 dark:stroke-gray-700" />
                                    <XAxis
                                        dataKey="name"
                                        angle={-45}
                                        textAnchor="end"
                                        height={100}
                                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                                        tickLine={false}
                                        axisLine={{ stroke: '#4b5563' }}
                                    />
                                    <YAxis
                                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                                        tickLine={false}
                                        axisLine={{ stroke: '#4b5563' }}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '0.5rem', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                        wrapperClassName="dark:!bg-gray-800 dark:!text-white rounded-lg shadow-lg"
                                        labelStyle={{ color: '#1f2937' }} // Will need override in dark mode or custom content
                                    />
                                    <Bar dataKey="classes" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400">
                                No subjects yet
                            </div>
                        )}
                    </div>

                    {/* Student Engagement Chart */}
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 transition-colors">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Student Engagement</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={engagementData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ percent }) => `${((percent || 0) * 100).toFixed(0)}%`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {engagementData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: '0.5rem', border: 'none' }}
                                    wrapperClassName="dark:!bg-gray-800 dark:!text-white rounded-lg shadow-lg"
                                />
                                <Legend wrapperStyle={{ color: '#9ca3af' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Course Details */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Course Info */}
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 transition-colors">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Course Information</h2>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Level:</span>
                                <span className="font-medium text-gray-900 dark:text-gray-200 capitalize">{data.course.level}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Category:</span>
                                <span className="font-medium text-gray-900 dark:text-gray-200 capitalize">{data.course.category}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Status:</span>
                                <span className={`font-medium ${data.course.is_published ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                                    {data.course.is_published ? 'Published' : 'Draft'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Total Subjects:</span>
                                <span className="font-medium text-gray-900 dark:text-gray-200">{data.statistics.total_subjects}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Total Classes:</span>
                                <span className="font-medium text-gray-900 dark:text-gray-200">{data.statistics.total_classes}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Total Tests:</span>
                                <span className="font-medium text-gray-900 dark:text-gray-200">{data.statistics.total_tests}</span>
                            </div>
                        </div>
                    </div>

                    {/* Subjects List */}
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 transition-colors">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Subjects ({data.subjects.length})</h2>
                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                            {data.subjects.map((subject) => (
                                <div key={subject.subject_id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg transition-colors">
                                    <div className="flex items-center gap-3">
                                        <BookOpen className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{subject.title}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
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
