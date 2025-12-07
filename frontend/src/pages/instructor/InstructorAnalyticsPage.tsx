import { useState, useEffect } from 'react';
import { instructorService } from '../../services/instructor.service';
import { Loader2, TrendingUp, Users, BookOpen, Star, MessageSquare } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { StatsCard } from '../../components/instructor/StatsCard';

export const InstructorAnalyticsPage = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await instructorService.getPerformance();
            setData(response);
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

    if (!data) return null;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Performance Analytics</h1>
                    <p className="mt-2 text-gray-600">Deep insights into your teaching impact</p>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatsCard
                        title="Total Students"
                        value={data.total_students}
                        icon={Users}
                        color="blue"
                    />
                    <StatsCard
                        title="Classes Conducted"
                        value={data.total_classes}
                        icon={BookOpen}
                        color="purple"
                    />
                    <StatsCard
                        title="Average Rating"
                        value={data.average_rating}
                        icon={Star}
                        color="orange"
                    />
                    <StatsCard
                        title="Total Courses"
                        value={data.total_courses}
                        icon={TrendingUp}
                        color="green"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Course Enrollments Chart */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="text-lg font-bold text-gray-900 mb-6">Enrollments by Course</h2>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.course_stats}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="title" hide />
                                    <YAxis />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        cursor={{ fill: '#f3f4f6' }}
                                    />
                                    <Bar dataKey="enrollments" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Students" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* AI Insights */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-indigo-50 rounded-lg">
                                <MessageSquare className="w-5 h-5 text-indigo-600" />
                            </div>
                            <h2 className="text-lg font-bold text-gray-900">AI Feedback Analysis</h2>
                        </div>

                        {data.ai_insights?.sentiment_analysis ? (
                            <div className="prose prose-indigo max-w-none">
                                <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700 whitespace-pre-wrap font-mono">
                                    {data.ai_insights.sentiment_analysis}
                                </div>
                                <p className="text-xs text-gray-500 mt-4">
                                    Based on analysis of {data.ai_insights.total_feedback_analyzed} student reviews.
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                                <MessageSquare className="w-12 h-12 mb-3 text-gray-300" />
                                <p>Not enough feedback for AI analysis yet.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Detailed Course Stats Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <h2 className="text-lg font-bold text-gray-900">Course Performance Details</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course Title</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enrollments</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue Share (Est.)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {data.course_stats.map((course: any) => (
                                    <tr key={course.course_id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {course.title}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {course.enrollments}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            ${(course.enrollments * 49.99 * 0.7).toFixed(2)} {/* Estimated calculation */}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};
