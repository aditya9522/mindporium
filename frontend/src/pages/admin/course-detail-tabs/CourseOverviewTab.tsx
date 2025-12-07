import {
    Users, BookOpen, GraduationCap, TestTube, Star,
    TrendingUp, CheckCircle, FileText, MessageSquare
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

interface CourseOverviewTabProps {
    courseData: any;
    refreshData: () => void;
}

export const CourseOverviewTab = ({ courseData }: CourseOverviewTabProps) => {

    if (!courseData) {
        return <div className="text-center py-12 text-gray-500">Loading...</div>;
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
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-indigo-50 rounded-lg">
                            <Users className="w-6 h-6 text-indigo-600" />
                        </div>
                        <TrendingUp className="w-5 h-5 text-green-500" />
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900">{stats.total_enrollments || 0}</h3>
                    <p className="text-sm text-gray-600 mt-1">Total Enrollments</p>
                    <p className="text-xs text-green-600 mt-2">+{stats.recent_enrollments_7d || 0} this week</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-green-50 rounded-lg">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900">{stats.active_students || 0}</h3>
                    <p className="text-sm text-gray-600 mt-1">Active Students</p>
                    <p className="text-xs text-gray-500 mt-2">{courseData.engagement?.active_student_rate || 0}% engagement</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-purple-50 rounded-lg">
                            <BookOpen className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900">{stats.total_subjects || 0}</h3>
                    <p className="text-sm text-gray-600 mt-1">Subjects</p>
                    <p className="text-xs text-gray-500 mt-2">{stats.total_classes || 0} total classes</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-amber-50 rounded-lg">
                            <Star className="w-6 h-6 text-amber-600" />
                        </div>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900">{stats.average_rating || 0}</h3>
                    <p className="text-sm text-gray-600 mt-1">Average Rating</p>
                    <p className="text-xs text-gray-500 mt-2">{stats.total_feedback || 0} reviews</p>
                </div>
            </div>

            {/* Course Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Course Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Basic Details</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Level:</span>
                                <span className="font-semibold text-gray-900 capitalize">{course.level}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Category:</span>
                                <span className="font-semibold text-gray-900 capitalize">{course.category}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Status:</span>
                                <span className={`font-semibold ${course.is_published ? 'text-green-600' : 'text-yellow-600'}`}>
                                    {course.is_published ? 'Published' : 'Draft'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Created:</span>
                                <span className="font-semibold text-gray-900">
                                    {course.created_at ? new Date(course.created_at).toLocaleDateString() : 'N/A'}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Performance Metrics</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Completion Rate:</span>
                                <span className="font-semibold text-gray-900">{stats.completion_rate || 0}%</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Total Tests:</span>
                                <span className="font-semibold text-gray-900">{stats.total_tests || 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Total Classes:</span>
                                <span className="font-semibold text-gray-900">{stats.total_classes || 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Feedbacks:</span>
                                <span className="font-semibold text-gray-900">{stats.total_feedback || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Subjects Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-indigo-600" />
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
                        <div className="h-[300px] flex items-center justify-center text-gray-500">
                            No subjects data available
                        </div>
                    )}
                </div>

                {/* Student Engagement */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5 text-green-600" />
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
                        <div className="h-[300px] flex items-center justify-center text-gray-500">
                            No engagement data available
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-lg border border-indigo-200">
                    <div className="flex items-center gap-3">
                        <GraduationCap className="w-8 h-8 text-indigo-600" />
                        <div>
                            <div className="text-2xl font-bold text-indigo-900">{stats.total_classes || 0}</div>
                            <div className="text-xs text-indigo-600">Total Classes</div>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-3">
                        <TestTube className="w-8 h-8 text-purple-600" />
                        <div>
                            <div className="text-2xl font-bold text-purple-900">{stats.total_tests || 0}</div>
                            <div className="text-xs text-purple-600">Tests</div>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center gap-3">
                        <FileText className="w-8 h-8 text-green-600" />
                        <div>
                            <div className="text-2xl font-bold text-green-900">-</div>
                            <div className="text-xs text-green-600">Resources</div>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-lg border border-amber-200">
                    <div className="flex items-center gap-3">
                        <MessageSquare className="w-8 h-8 text-amber-600" />
                        <div>
                            <div className="text-2xl font-bold text-amber-900">-</div>
                            <div className="text-xs text-amber-600">Discussions</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Description */}
            {course.description && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Course Description</h2>
                    <p className="text-gray-700 leading-relaxed">{course.description}</p>
                </div>
            )}
        </div>
    );
};
