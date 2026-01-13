import { useState, useEffect } from 'react';
import { Search, Users, BookOpen, TrendingUp, Mail, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../lib/axios';
import { PageLoader } from '../../components/common/PageLoader';

interface StudentData {
    user_id: number;
    full_name: string;
    email: string;
    enrolled_courses: number;
    total_progress: number;
    attendance_percent?: number;
    last_active?: string;
    courses: Array<{
        course_id: number;
        course_title: string;
        progress_percent: number;
        enrolled_at: string;
    }>;
}

export const InstructorStudentsPage = () => {
    // const { user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [students, setStudents] = useState<StudentData[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCourse, setSelectedCourse] = useState<string>('all');
    const [courses, setCourses] = useState<any[]>([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Fetch instructor's courses
            const coursesResponse = await api.get('/courses/instructor/my-courses');
            setCourses(coursesResponse.data);

            // Fetch students data
            const studentsResponse = await api.get('/dashboard/instructor/students');
            setStudents(studentsResponse.data);
        } catch (error) {
            console.error('Failed to fetch students:', error);
            toast.error('Failed to load students data');
        } finally {
            setLoading(false);
        }
    };

    const filteredStudents = students.filter(student => {
        const matchesSearch = student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.email.toLowerCase().includes(searchTerm.toLowerCase());

        if (selectedCourse === 'all') return matchesSearch;

        return matchesSearch && student.courses.some(c => c.course_id === parseInt(selectedCourse));
    });

    if (loading) {
        return <PageLoader />;
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-10 text-center md:text-left">
                    <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-primary-600 dark:from-gray-100 dark:to-primary-400 tracking-tight mb-2">My Students</h1>
                    <p className="text-lg text-gray-500 dark:text-gray-400 font-medium">Track progress and performance across your enrolled students</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
                    <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-[0_2px_15px_rgb(0,0,0,0.04)] border border-gray-200 dark:border-gray-800 p-6 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 transform hover:-translate-y-1">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-14 h-14 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-sm">
                                <Users className="w-7 h-7" />
                            </div>
                        </div>
                        <h3 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 mb-1 tracking-tight">{students.length}</h3>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total Students</p>
                    </div>

                    <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-[0_2px_15px_rgb(0,0,0,0.04)] border border-gray-200 dark:border-gray-800 p-6 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 transform hover:-translate-y-1">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-14 h-14 rounded-xl bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center shadow-sm">
                                <BookOpen className="w-7 h-7" />
                            </div>
                        </div>
                        <h3 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 mb-1 tracking-tight">{courses.length}</h3>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Active Courses</p>
                    </div>

                    <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-[0_2px_15px_rgb(0,0,0,0.04)] border border-gray-200 dark:border-gray-800 p-6 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 transform hover:-translate-y-1">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-14 h-14 rounded-xl bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center shadow-sm">
                                <TrendingUp className="w-7 h-7" />
                            </div>
                        </div>
                        <h3 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 mb-1 tracking-tight">
                            {students.length > 0
                                ? Math.round(students.reduce((sum, s) => sum + s.total_progress, 0) / students.length)
                                : 0}%
                        </h3>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Avg. Progress</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 mb-8 transition-colors duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search students by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-12 pr-4 py-3 w-full border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none text-gray-700 dark:text-gray-300 bg-gray-50/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 focus:bg-white dark:focus:bg-gray-800"
                            />
                        </div>
                        <select
                            value={selectedCourse}
                            onChange={(e) => setSelectedCourse(e.target.value)}
                            className="px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none text-gray-700 dark:text-gray-300 bg-gray-50/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 focus:bg-white dark:focus:bg-gray-800 cursor-pointer"
                        >
                            <option value="all">All Courses</option>
                            {courses.map(course => (
                                <option key={course.id} value={course.id}>{course.title}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Students List */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-[0_2px_15px_rgb(0,0,0,0.04)] border border-gray-200 dark:border-gray-800 overflow-hidden transition-colors duration-300">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                                    <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Student</th>
                                    <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Enrolled Courses</th>
                                    <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Avg. Progress</th>
                                    <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Attendance</th>
                                    <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Last Active</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                                {filteredStudents.map((student) => (
                                    <tr key={student.user_id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center">
                                                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md shrink-0 border-2 border-white">
                                                    {student.full_name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="ml-4">
                                                    <Link
                                                        to={`/instructor/students/${student.user_id}`}
                                                        className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors flex items-center gap-2"
                                                    >
                                                        {student.full_name}
                                                        <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    </Link>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-0.5 font-medium">
                                                        <Mail className="w-3.5 h-3.5" />
                                                        {student.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-gray-700 dark:text-gray-300">
                                            <div className="flex flex-col gap-1.5">
                                                {student.courses.map(c => (
                                                    <span key={c.course_id} className="inline-flex items-center w-fit px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border border-primary-100 dark:border-primary-800">
                                                        {c.course_title}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-2 max-w-[120px] shadow-inner overflow-hidden">
                                                    <div
                                                        className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full rounded-full"
                                                        style={{ width: `${student.total_progress}%` }}
                                                    />
                                                </div>
                                                <span className="text-sm font-bold text-gray-700 dark:text-gray-300 w-10">{Math.round(student.total_progress)}%</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${(student as any).attendance_percent >= 75 ? 'bg-green-50 text-green-700' :
                                                    (student as any).attendance_percent >= 50 ? 'bg-yellow-50 text-yellow-700' :
                                                        'bg-red-50 text-red-700'
                                                    }`}>
                                                    {Math.round((student as any).attendance_percent || 0)}%
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-sm font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500">
                                            {student.last_active ? new Date(student.last_active).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredStudents.length === 0 && (
                        <div className="text-center py-20 text-gray-500 dark:text-gray-400 dark:text-gray-500">
                            <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100 dark:border-gray-800">
                                <Users className="w-10 h-10 text-gray-300 dark:text-gray-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">No students found</h3>
                            <p>Try adjusting your search or filters</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
