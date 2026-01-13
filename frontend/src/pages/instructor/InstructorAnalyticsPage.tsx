import { useState, useEffect } from 'react';
import { instructorService } from '../../services/instructor.service';
import { TrendingUp, Users, BookOpen, Star, MessageSquare } from 'lucide-react';
import { PageLoader } from '../../components/common/PageLoader';
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
        return <PageLoader />;
    }

    if (!data) return null;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-10 text-center md:text-left">
                    <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-primary-600 dark:from-gray-100 dark:to-primary-400 tracking-tight mb-2">Performance Analytics</h1>
                    <p className="text-lg text-gray-500 dark:text-gray-400 font-medium">Deep insights into your teaching impact and student engagement</p>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
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

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                    {/* Course Enrollments Chart */}
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-[0_2px_15px_rgb(0,0,0,0.04)] dark:shadow-[0_2px_15px_rgb(0,0,0,0.2)] border border-gray-100 dark:border-gray-800 p-8 transition-colors duration-300">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
                            <div className="w-1 h-6 bg-primary-600 dark:bg-primary-400 rounded-full"></div>
                            Enrollments by Course
                        </h2>
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.course_stats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorEnrollments" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                    <XAxis dataKey="title" hide />
                                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                                    <Tooltip
                                        cursor={{ fill: '#f9fafb' }}
                                        contentStyle={{
                                            backgroundColor: '#ffffff',
                                            borderRadius: '12px',
                                            border: '1px solid #f3f4f6',
                                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                                            padding: '12px'
                                        }}
                                        labelStyle={{ fontWeight: 600, color: '#111827', marginBottom: '4px' }}
                                    />
                                    <Bar
                                        dataKey="enrollments"
                                        fill="url(#colorEnrollments)"
                                        radius={[8, 8, 0, 0]}
                                        name="Students"
                                        barSize={40}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* AI Insights */}
                    <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 rounded-2xl shadow-xl p-8 text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 opacity-20 group-hover:opacity-30 transition-opacity duration-700">
                            <MessageSquare className="w-64 h-64 text-white blur-3xl" />
                        </div>

                        <div className="flex items-center gap-4 mb-8 relative z-10">
                            <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 shadow-inner">
                                <MessageSquare className="w-6 h-6 text-indigo-300" />
                            </div>
                            <h2 className="text-xl font-bold">AI Feedback Analysis</h2>
                        </div>

                        {data.ai_insights?.sentiment_analysis ? (
                            <div className="relative z-10">
                                <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 text-indigo-100 leading-relaxed font-medium shadow-lg mb-4">
                                    "{data.ai_insights.sentiment_analysis}"
                                </div>
                                <div className="flex items-center gap-2 text-sm text-indigo-300 ml-1">
                                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                                    Analysis based on {data.ai_insights.total_feedback_analyzed} student reviews
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-48 text-indigo-300/80 relative z-10">
                                <MessageSquare className="w-12 h-12 mb-4 opacity-50" />
                                <p className="font-medium">Waiting for more feedback to generate insights...</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Detailed Course Stats Table */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-[0_2px_15px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
                    <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Course Financials & Engagement</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100 dark:border-gray-800">
                                    <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Course Title</th>
                                    <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Enrollments</th>
                                    <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Est. Revenue Share</th>
                                    <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Performance</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                                {data.course_stats.map((course: any) => (
                                    <tr key={course.course_id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors group">
                                        <td className="px-8 py-5 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                            {course.title}
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 font-medium">
                                            {course.enrollments} Students
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-100">
                                                ${(course.enrollments * 49.99 * 0.7).toFixed(2)}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            <div className="w-full max-w-[140px] bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                                                <div className="bg-primary-500 dark:bg-primary-400 h-full rounded-full" style={{ width: `${Math.min(course.enrollments * 5, 100)}%` }}></div>
                                            </div>
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
