import {
    Users, BookOpen, GraduationCap, TestTube, Star,
    TrendingUp, CheckCircle, FileText, MessageSquare, Loader2
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

interface CourseOverviewTabProps {
    courseData: any;
    refreshData: () => void;
}

export const CourseOverviewTab = ({ courseData }: CourseOverviewTabProps) => {

    if (!courseData) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 text-primary-600 dark:text-primary-400 animate-spin" />
            </div>
        );
    }

    const stats = courseData.statistics || {};
    const course = courseData.course || {};

    // Prepare chart data
    const subjectData = (courseData.subjects || []).map((subject: any) => ({
        name: subject.title,
        classes: subject.total_classes || 0
    }));

    const engagementData = [
        { name: 'Active', value: stats.active_students || 0 },
        { name: 'Inactive', value: (stats.total_enrollments || 0) - (stats.active_students || 0) }
    ];

    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 hover:shadow-md transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-primary-50 dark:bg-primary-900/30 rounded-lg">
                            <Users className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                        </div>
                        <TrendingUp className="w-5 h-5 text-green-500" />
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.total_enrollments || 0}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total Enrollments</p>
                    <p className="text-xs text-green-600 mt-2">+{stats.recent_enrollments_7d || 0} this week</p>
                </div>

                <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 hover:shadow-md transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
                            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.active_students || 0}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Active Students</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{courseData.engagement?.active_student_rate || 0}% engagement</p>
                </div>

                <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 hover:shadow-md transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                            <BookOpen className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.total_subjects || 0}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Subjects</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{stats.total_classes || 0} total classes</p>
                </div>

                <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 hover:shadow-md transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-amber-50 dark:bg-amber-900/30 rounded-lg">
                            <Star className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                        </div>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.average_rating || 0}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Average Rating</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{stats.total_feedback || 0} reviews</p>
                </div>
            </div>

            {/* Course Information */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 transition-colors duration-300">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Course Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Basic Details</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Level:</span>
                                <span className="font-semibold text-gray-900 dark:text-gray-100 capitalize">{course.level}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Category:</span>
                                <span className="font-semibold text-gray-900 dark:text-gray-100 capitalize">{course.category}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Status:</span>
                                <span className={`font-semibold ${course.is_published ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                                    {course.is_published ? 'Published' : 'Draft'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Created:</span>
                                <span className="font-semibold text-gray-900 dark:text-gray-100">
                                    {course.created_at ? new Date(course.created_at).toLocaleDateString() : 'N/A'}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Performance Metrics</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Completion Rate:</span>
                                <span className="font-semibold text-gray-900 dark:text-gray-100">{stats.completion_rate || 0}%</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Total Tests:</span>
                                <span className="font-semibold text-gray-900 dark:text-gray-100">{stats.total_tests || 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Total Classes:</span>
                                <span className="font-semibold text-gray-900 dark:text-gray-100">{stats.total_classes || 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Feedbacks:</span>
                                <span className="font-semibold text-gray-900 dark:text-gray-100">{stats.total_feedback || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Subjects Chart */}
                <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 transition-colors duration-300">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                        Classes per Subject
                    </h2>
                    {subjectData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={subjectData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="classes" fill="#6366f1" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400">
                            No subjects data available
                        </div>
                    )}
                </div>

                {/* Student Engagement */}
                <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 transition-colors duration-300">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
                        Student Engagement
                    </h2>
                    {engagementData[0].value > 0 || engagementData[1].value > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={engagementData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {engagementData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400">
                            No engagement data available
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 hover:shadow-md transition-all">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                            <GraduationCap className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <div className="text-xl font-bold text-gray-900 dark:text-gray-100">{stats.total_classes || 0}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Total Classes</div>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 hover:shadow-md transition-all">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                            <TestTube className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <div className="text-xl font-bold text-gray-900 dark:text-gray-100">{stats.total_tests || 0}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Tests</div>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 hover:shadow-md transition-all">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-50 dark:bg-green-900/30 rounded-lg">
                            <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <div className="text-xl font-bold text-gray-900 dark:text-gray-100">{stats.total_resources || 0}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Resources</div>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 hover:shadow-md transition-all">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-50 dark:bg-amber-900/30 rounded-lg">
                            <MessageSquare className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                            <div className="text-xl font-bold text-gray-900 dark:text-gray-100">{stats.total_questions || 0}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Q&A</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Description */}
            {course.description && (
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 transition-colors duration-300">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Course Description</h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{course.description}</p>
                </div>
            )}
        </div>
    );
};
