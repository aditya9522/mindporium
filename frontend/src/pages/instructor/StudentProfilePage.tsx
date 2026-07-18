import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Mail, Calendar, BookOpen, Clock,
    TrendingUp, ArrowLeft,
    CheckCircle, MessageSquare, Activity, Target,
    User as UserIcon, ArrowDownToLine
} from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import { PageLoader } from '../../components/common/PageLoader';
import {
    XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';

interface StudentProfile {
    user_id: number;
    full_name: string;
    email: string;
    enrolled_courses: number;
    total_progress: number;
    last_active: string | null;
    courses: Array<{
        course_id: number;
        course_title: string;
        progress_percent: number;
        enrolled_at: string;
    }>;
    recent_activity: Array<{
        text: string;
        time: string;
        type: string;
    }>;
    track_data: Array<{
        date: string;
        progress: number;
    }>;
}

export const StudentProfilePage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [student, setStudent] = useState<StudentProfile | null>(null);

    useEffect(() => {
        if (id) {
            fetchStudentDetails();
        }
    }, [id]);

    const fetchStudentDetails = async () => {
        try {
            const response = await api.get(`/dashboard/instructor/students/${id}`);
            setStudent(response.data);
        } catch (error) {
            console.error('Failed to fetch student details:', error);
            toast.error('Failed to load student details');
            navigate('/instructor/students');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <PageLoader />;
    if (!student) return null;

    // Helper to get icon for activity
    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'classroom': return MessageSquare;
            case 'submission': return Target;
            default: return Activity;
        }
    };

    const getActivityColor = (type: string) => {
        switch (type) {
            case 'classroom': return 'blue';
            case 'submission': return 'green';
            default: return 'purple';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Navigation */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Students List
                    </button>
                </div>

                {/* Page Title & Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
                        <UserIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                        Student Profile
                    </h1>
                    <div className="flex gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all shadow-sm">
                            <MessageSquare className="w-4 h-4" />
                            Message Student
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-bold hover:bg-primary-700 transition-all shadow-sm shadow-primary-200 dark:shadow-none">
                            <ArrowDownToLine className="w-4 h-4" />
                            Download Report
                        </button>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Profile Card */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors">
                            <div className="h-24 bg-linear-to-r from-indigo-500 to-purple-600"></div>
                            <div className="px-6 pb-6 -mt-12 text-center">
                                <div className="inline-flex p-1 bg-white dark:bg-gray-900 rounded-full shadow-lg relative z-10 transition-colors">
                                    <div className="w-24 h-24 bg-linear-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-extrabold border-4 border-white dark:border-gray-900 transition-colors">
                                        {student.full_name?.charAt(0).toUpperCase()}
                                    </div>
                                </div>
                                <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">{student.full_name}</h2>
                                <p className="text-gray-500 dark:text-gray-400 font-medium flex items-center justify-center gap-1.5 mt-1">
                                    <Mail className="w-4 h-4" />
                                    {student.email}
                                </p>

                                <div className="mt-6 flex flex-wrap justify-center gap-2">
                                    <span className="px-3 py-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-bold border border-green-100 dark:border-green-800">
                                        Verified Student
                                    </span>
                                    <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs font-bold border border-blue-100 dark:border-blue-800">
                                        Active
                                    </span>
                                </div>
                            </div>

                            <div className="border-t border-gray-100 dark:border-gray-800 px-6 py-4">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2 font-medium">
                                            <Calendar className="w-4 h-4" />
                                            Enrolled Since
                                        </span>
                                        <span className="font-bold text-gray-900 dark:text-gray-100">
                                            {student.courses[0] ? new Date(student.courses[0].enrolled_at).toLocaleDateString() : 'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2 font-medium">
                                            <Clock className="w-4 h-4" />
                                            Last Active
                                        </span>
                                        <span className="font-bold text-gray-900 dark:text-gray-100">
                                            {student.last_active ? new Date(student.last_active).toLocaleDateString() : 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm transition-colors">
                                <div className="p-2 bg-primary-50 dark:bg-primary-900/30 rounded-lg w-fit mb-3">
                                    <BookOpen className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                </div>
                                <div className="text-xl font-bold text-gray-900 dark:text-white">{student.enrolled_courses}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">Courses</div>
                            </div>
                            <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm transition-colors">
                                <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg w-fit mb-3">
                                    <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div className="text-xl font-bold text-gray-900 dark:text-white">{Math.round(student.total_progress)}%</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">Avg. Progress</div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Tracks and More */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Student Track Chart */}
                        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 transition-colors">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        <Activity className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                        Learning Track
                                    </h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Progress overview for the last 7 days</p>
                                </div>
                            </div>

                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={student.track_data || []}>
                                        <defs>
                                            <linearGradient id="colorProg" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" className="dark:opacity-20" />
                                        <XAxis
                                            dataKey="date"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 500 }}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 500 }}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                borderRadius: '12px',
                                                border: 'none',
                                                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                            }}
                                            wrapperClassName="dark:!bg-gray-800 dark:!text-white rounded-xl"
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="progress"
                                            stroke="#6366f1"
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorProg)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Course Progress List */}
                        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors">
                            <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                    Enrolled Courses
                                </h2>
                            </div>
                            <div className="divide-y divide-gray-50 dark:divide-gray-800">
                                {student.courses.map((course) => (
                                    <div key={course.course_id} className="p-6 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors group">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                                        {course.course_title}
                                                    </h3>
                                                    {course.progress_percent >= 100 && (
                                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 font-medium">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-3.5 h-3.5" />
                                                        {new Date(course.enrolled_at).toLocaleDateString()}
                                                    </span>
                                                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs font-bold text-gray-600 dark:text-gray-300">
                                                        Enrolled
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="md:w-64">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Progress</span>
                                                    <span className="text-sm font-bold text-primary-600 dark:text-primary-400">{Math.round(course.progress_percent)}%</span>
                                                </div>
                                                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 shadow-inner overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-1000 ${course.progress_percent >= 100
                                                            ? 'bg-linear-to-r from-green-500 to-emerald-600'
                                                            : 'bg-linear-to-r from-indigo-500 to-purple-600'
                                                            }`}
                                                        style={{ width: `${course.progress_percent}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 transition-colors">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                Recent Activity
                            </h2>
                            <div className="space-y-6">
                                {student.recent_activity && student.recent_activity.length > 0 ? (
                                    student.recent_activity.map((activity, i) => {
                                        const Icon = getActivityIcon(activity.type);
                                        const color = getActivityColor(activity.type);
                                        return (
                                            <div key={i} className="flex gap-4">
                                                <div className={`w-10 h-10 rounded-xl bg-${color}-50 dark:bg-${color}-900/30 flex items-center justify-center shrink-0`}>
                                                    <Icon className={`w-5 h-5 text-${color}-600 dark:text-${color}-400`} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{activity.text}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">
                                                        {new Date(activity.time).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                                        No recent activity found.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
