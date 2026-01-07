import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Mail, Calendar, BookOpen, Clock,
    TrendingUp, Award, ArrowLeft,
    CheckCircle, MessageSquare, Activity, Target
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
            // Reusing the instructor students list and filtering for now
            // In a real app, we'd have a dedicated /instructor/students/:id endpoint
            const response = await api.get('/dashboard/instructor/students');
            const studentData = response.data.find((s: any) => s.user_id === parseInt(id!));

            if (studentData) {
                setStudent(studentData);
            } else {
                toast.error('Student not found');
                navigate('/instructor/students');
            }
        } catch (error) {
            console.error('Failed to fetch student details:', error);
            toast.error('Failed to load student details');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <PageLoader />;
    if (!student) return null;

    // Mock track data for visualization
    const trackData = [
        { date: 'Mon', progress: 20 },
        { date: 'Tue', progress: 25 },
        { date: 'Wed', progress: 40 },
        { date: 'Thu', progress: 45 },
        { date: 'Fri', progress: 60 },
        { date: 'Sat', progress: 75 },
        { date: 'Sun', progress: 85 },
    ];

    return (
        <div className="min-h-screen bg-gray-50/50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Back Button & Header */}
                <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 font-medium transition-colors w-fit"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Students
                    </button>
                    <div className="flex gap-3">
                        <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm">
                            Message Student
                        </button>
                        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-all shadow-sm">
                            Download Report
                        </button>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Profile Card */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="h-24 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
                            <div className="px-6 pb-6 -mt-12 text-center">
                                <div className="inline-flex p-1 bg-white rounded-full shadow-lg relative z-10">
                                    <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-extrabold border-4 border-white">
                                        {student.full_name.charAt(0).toUpperCase()}
                                    </div>
                                </div>
                                <h1 className="mt-4 text-2xl font-bold text-gray-900">{student.full_name}</h1>
                                <p className="text-gray-500 font-medium flex items-center justify-center gap-1.5 mt-1">
                                    <Mail className="w-4 h-4" />
                                    {student.email}
                                </p>

                                <div className="mt-6 flex flex-wrap justify-center gap-2">
                                    <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold border border-green-100">
                                        Verified Student
                                    </span>
                                    <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-100">
                                        Active
                                    </span>
                                </div>
                            </div>

                            <div className="border-t border-gray-50 px-6 py-4">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-500 flex items-center gap-2 font-medium">
                                            <Calendar className="w-4 h-4" />
                                            Enrolled Since
                                        </span>
                                        <span className="font-bold text-gray-900">
                                            {student.courses[0] ? new Date(student.courses[0].enrolled_at).toLocaleDateString() : 'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-500 flex items-center gap-2 font-medium">
                                            <Clock className="w-4 h-4" />
                                            Last Active
                                        </span>
                                        <span className="font-bold text-gray-900">
                                            {student.last_active ? new Date(student.last_active).toLocaleDateString() : 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                <div className="p-2 bg-indigo-50 rounded-lg w-fit mb-3">
                                    <BookOpen className="w-5 h-5 text-indigo-600" />
                                </div>
                                <div className="text-xl font-bold text-gray-900">{student.enrolled_courses}</div>
                                <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">Courses</div>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                <div className="p-2 bg-purple-50 rounded-lg w-fit mb-3">
                                    <TrendingUp className="w-5 h-5 text-purple-600" />
                                </div>
                                <div className="text-xl font-bold text-gray-900">{Math.round(student.total_progress)}%</div>
                                <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">Avg. Progress</div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Tracks and More */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Student Track Chart */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                        <Activity className="w-5 h-5 text-indigo-600" />
                                        Learning Track
                                    </h2>
                                    <p className="text-sm text-gray-500 font-medium">Progress overview for the last 7 days</p>
                                </div>
                            </div>

                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={trackData}>
                                        <defs>
                                            <linearGradient id="colorProg" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
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
                                                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                                            }}
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
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-100">
                                <h2 className="text-xl font-bold text-gray-900">Enrolled Courses</h2>
                            </div>
                            <div className="divide-y divide-gray-50">
                                {student.courses.map((course) => (
                                    <div key={course.course_id} className="p-6 hover:bg-gray-50/50 transition-colors group">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                                                        {course.course_title}
                                                    </h3>
                                                    {course.progress_percent >= 100 && (
                                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-gray-500 font-medium">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-3.5 h-3.5" />
                                                        {new Date(course.enrolled_at).toLocaleDateString()}
                                                    </span>
                                                    <span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-bold text-gray-600">
                                                        Enrolled
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="md:w-64">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-xs font-bold text-gray-500 uppercase">Progress</span>
                                                    <span className="text-sm font-bold text-indigo-600">{Math.round(course.progress_percent)}%</span>
                                                </div>
                                                <div className="w-full bg-gray-100 rounded-full h-2 shadow-inner overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-1000 ${course.progress_percent >= 100
                                                            ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                                                            : 'bg-gradient-to-r from-indigo-500 to-purple-600'
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

                        {/* Recent Activity (Placeholder) */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>
                            <div className="space-y-6">
                                {[
                                    { icon: MessageSquare, color: 'blue', text: 'Joined classroom session: Web Development Fundamentals', time: '2 hours ago' },
                                    { icon: Award, color: 'purple', text: 'Completed Subject: Advanced React Patterns', time: 'Yesterday' },
                                    { icon: Target, color: 'green', text: 'Submitted Test: JavaScript Basics', time: '2 days ago' }
                                ].map((activity, i) => (
                                    <div key={i} className="flex gap-4">
                                        <div className={`w-10 h-10 rounded-xl bg-${activity.color}-50 flex items-center justify-center shrink-0`}>
                                            <activity.icon className={`w-5 h-5 text-${activity.color}-600`} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">{activity.text}</p>
                                            <p className="text-xs text-gray-500 font-medium mt-0.5">{activity.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
