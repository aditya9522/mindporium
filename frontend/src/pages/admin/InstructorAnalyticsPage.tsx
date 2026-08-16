import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminService } from '../../services/admin.service';
import { instructorService } from '../../services/instructor.service';
import { useAuthStore } from '../../store/auth.store';
import { ArrowLeft, Users, BookOpen, Star, Award, BarChart3, TrendingUp, Brain, ThumbsUp, AlertCircle } from 'lucide-react';
import { PageLoader } from '../../components/common/PageLoader';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import { formatNumber } from '../../lib/format';

export const InstructorAnalyticsPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [performanceData, setPerformanceData] = useState<any>(null);
    const [instructor, setInstructor] = useState<any>(null);

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        try {
            if (id) {
                // Admin viewing specific instructor
                const users = await adminService.getInstructors();
                const currentInstructor = users.find((u: any) => u.id === parseInt(id));
                setInstructor(currentInstructor);

                const performance = await adminService.getInstructorPerformance(parseInt(id));
                setPerformanceData(performance);
            } else {
                // Instructor viewing their own analytics
                setInstructor(user);
                const performance = await instructorService.getPerformance();
                setPerformanceData(performance);
            }
        } catch (error) {
            console.error('Failed to load instructor analytics:', error);
            toast.error('Failed to load analytics');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <PageLoader />;
    }

    if (!performanceData) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4">
                    <p className="text-center text-gray-600 dark:text-gray-400">No data available</p>
                </div>
            </div>
        );
    }

    // Prepare radar chart data
    const radarData = [
        { subject: 'Teaching', value: performanceData.average_rating * 20 || 0 },
        { subject: 'Engagement', value: (performanceData.total_students / 10) || 0 },
        { subject: 'Content', value: (performanceData.total_courses * 20) || 0 },
        { subject: 'Classes', value: (performanceData.total_classes / 5) || 0 },
        { subject: 'Feedback', value: (performanceData.ai_insights?.total_feedback_analyzed || 0) * 2 },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {id && (
                    <button
                        onClick={() => navigate('/admin/instructors')}
                        className="flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Instructors
                    </button>
                )}

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Performance Analytics</h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">{instructor?.full_name} - Detailed Performance Insights</p>
                </div>

                {/* Performance Score Card */}
                <div className="bg-linear-to-br from-purple-500 via-indigo-500 to-blue-500 rounded-2xl shadow-xl p-8 mb-8 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold mb-2">Overall Performance Score</h2>
                            <p className="text-purple-100">Based on multiple performance indicators</p>
                        </div>
                        <div className="text-center">
                            <div className="text-6xl font-bold mb-2">
                                {formatNumber(((performanceData?.average_rating || 0) / 5) * 100)}
                            </div>
                            <p className="text-purple-100">out of 100</p>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm dark:shadow-none border border-gray-100 dark:border-gray-800 hover:shadow-md dark:hover:shadow-indigo-900/10 transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center">
                                <BookOpen className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                            </div>
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{performanceData.total_courses}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Total Courses</p>
                    </div>

                    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm dark:shadow-none border border-gray-100 dark:border-gray-800 hover:shadow-md dark:hover:shadow-indigo-900/10 transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                                <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
                            </div>
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{performanceData.total_students}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Total Students</p>
                    </div>

                    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm dark:shadow-none border border-gray-100 dark:border-gray-800 hover:shadow-md dark:hover:shadow-indigo-900/10 transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                                <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                            </div>
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{performanceData.total_classes}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Classes Conducted</p>
                    </div>

                    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm dark:shadow-none border border-gray-100 dark:border-gray-800 hover:shadow-md dark:hover:shadow-indigo-900/10 transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 rounded-lg flex items-center justify-center">
                                <Star className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                            </div>
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{formatNumber(performanceData?.average_rating)}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Average Rating</p>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Course Enrollments Chart */}
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm dark:shadow-none border border-gray-100 dark:border-gray-800">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            Course Enrollments
                        </h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={performanceData.course_stats || []}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.1} />
                                <XAxis dataKey="title" angle={-45} textAnchor="end" height={100} stroke="#9ca3af" fontSize={10} fontWeight="bold" />
                                <YAxis stroke="#9ca3af" fontSize={10} fontWeight="bold" />
                                <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '12px', color: '#fff' }} itemStyle={{ color: '#fff' }} />
                                <Bar dataKey="enrollments" fill="#6366f1" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Performance Radar Chart */}
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm dark:shadow-none border border-gray-100 dark:border-gray-800">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            Performance Metrics
                        </h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <RadarChart data={radarData}>
                                <PolarGrid stroke="#374151" opacity={0.2} />
                                <PolarAngleAxis dataKey="subject" stroke="#9ca3af" fontSize={10} fontWeight="bold" />
                                <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#9ca3af" fontSize={10} fontWeight="bold" />
                                <Radar name="Performance" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                                <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '12px', color: '#fff' }} itemStyle={{ color: '#fff' }} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* AI Insights */}
                {performanceData.ai_insights?.sentiment_analysis && (
                    <div className="bg-linear-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-900/20 dark:via-purple-900/20 dark:to-pink-900/20 rounded-2xl shadow-sm border border-indigo-100 dark:border-indigo-900/30 p-8 mb-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                                <Brain className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">AI-Powered Insights</h2>
                                <p className="text-gray-600 dark:text-gray-400">Sentiment analysis from {performanceData.ai_insights.total_feedback_analyzed} feedback responses</p>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-900/80 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                            <div className="prose dark:prose-invert max-w-none">
                                <div className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                    <ReactMarkdown>{performanceData.ai_insights.sentiment_analysis}</ReactMarkdown>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Course Performance Table */}
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm dark:shadow-none border border-gray-100 dark:border-gray-800 overflow-hidden mb-8">
                    <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            Course Performance Breakdown
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Course</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Enrollments</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Performance</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                {performanceData.course_stats?.map((course: any, index: number) => (
                                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900 dark:text-white">{course.title}</div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">Course ID: {course.course_id}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Users className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                                                <span className="font-semibold text-gray-900 dark:text-white">{course.enrollments}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {course.enrollments > 50 ? (
                                                    <>
                                                        <ThumbsUp className="w-4 h-4 text-green-500" />
                                                        <span className="text-green-600 font-medium">Excellent</span>
                                                    </>
                                                ) : course.enrollments > 20 ? (
                                                    <>
                                                        <TrendingUp className="w-4 h-4 text-blue-500" />
                                                        <span className="text-blue-600 font-medium">Good</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <AlertCircle className="w-4 h-4 text-amber-500" />
                                                        <span className="text-amber-600 font-medium">Needs Attention</span>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Key Insights */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm dark:shadow-none border border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                <ThumbsUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                            </div>
                            <h3 className="font-bold text-gray-900 dark:text-white">Strengths</h3>
                        </div>
                        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                            <li className="flex items-start gap-2">
                                <span className="text-green-500 mt-1">•</span>
                                <span>High student engagement across courses</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-500 mt-1">•</span>
                                <span>Consistent positive feedback ratings</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-500 mt-1">•</span>
                                <span>Strong course completion rates</span>
                            </li>
                        </ul>
                    </div>

                    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm dark:shadow-none border border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                                <TrendingUp className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <h3 className="font-bold text-gray-900 dark:text-white">Opportunities</h3>
                        </div>
                        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                            <li className="flex items-start gap-2">
                                <span className="text-amber-500 mt-1">•</span>
                                <span>Expand course offerings in popular topics</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-amber-500 mt-1">•</span>
                                <span>Increase live class frequency</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-amber-500 mt-1">•</span>
                                <span>Develop advanced level content</span>
                            </li>
                        </ul>
                    </div>

                    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm dark:shadow-none border border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                                <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <h3 className="font-bold text-gray-900 dark:text-white">Achievements</h3>
                        </div>
                        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                            <li className="flex items-start gap-2">
                                <span className="text-indigo-500 mt-1">•</span>
                                <span>{performanceData?.total_students || 0}+ students taught</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-indigo-500 mt-1">•</span>
                                <span>{performanceData?.total_classes || 0}+ classes conducted</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-indigo-500 mt-1">•</span>
                                <span>{formatNumber(performanceData?.average_rating)}/5.0 average rating</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};
