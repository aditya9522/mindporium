import { useState, useEffect } from 'react';
import { Search, Users, BookOpen, TrendingUp, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/axios';
import { PageLoader } from '../../components/common/PageLoader';

interface StudentData {
    user_id: number;
    full_name: string;
    email: string;
    enrolled_courses: number;
    total_progress: number;
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
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-10 text-center md:text-left">
                    <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-indigo-600 tracking-tight mb-2">My Students</h1>
                    <p className="text-lg text-gray-500 font-medium">Track progress and performance across your enrolled students</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-[0_2px_15px_rgb(0,0,0,0.04)] border border-gray-100 p-6 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 transform hover:-translate-y-1">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-14 h-14 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm">
                                <Users className="w-7 h-7" />
                            </div>
                        </div>
                        <h3 className="text-3xl font-extrabold text-gray-900 mb-1 tracking-tight">{students.length}</h3>
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Students</p>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-[0_2px_15px_rgb(0,0,0,0.04)] border border-gray-100 p-6 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 transform hover:-translate-y-1">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-14 h-14 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm">
                                <BookOpen className="w-7 h-7" />
                            </div>
                        </div>
                        <h3 className="text-3xl font-extrabold text-gray-900 mb-1 tracking-tight">{courses.length}</h3>
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Active Courses</p>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-[0_2px_15px_rgb(0,0,0,0.04)] border border-gray-100 p-6 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 transform hover:-translate-y-1">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-14 h-14 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shadow-sm">
                                <TrendingUp className="w-7 h-7" />
                            </div>
                        </div>
                        <h3 className="text-3xl font-extrabold text-gray-900 mb-1 tracking-tight">
                            {students.length > 0
                                ? Math.round(students.reduce((sum, s) => sum + s.total_progress, 0) / students.length)
                                : 0}%
                        </h3>
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Avg. Progress</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search students by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-12 pr-4 py-3 w-full border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none text-gray-700 bg-gray-50/50 hover:bg-white focus:bg-white"
                            />
                        </div>
                        <select
                            value={selectedCourse}
                            onChange={(e) => setSelectedCourse(e.target.value)}
                            className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none text-gray-700 bg-gray-50/50 hover:bg-white focus:bg-white cursor-pointer"
                        >
                            <option value="all">All Courses</option>
                            {courses.map(course => (
                                <option key={course.id} value={course.id}>{course.title}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Students List */}
                <div className="bg-white rounded-2xl shadow-[0_2px_15px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Student</th>
                                    <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Enrolled Courses</th>
                                    <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Avg. Progress</th>
                                    <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Last Active</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredStudents.map((student) => (
                                    <tr key={student.user_id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center">
                                                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md shrink-0 border-2 border-white">
                                                    {student.full_name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="ml-4">
                                                    <p className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{student.full_name}</p>
                                                    <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-0.5 font-medium">
                                                        <Mail className="w-3.5 h-3.5" />
                                                        {student.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-gray-700">
                                            <div className="flex flex-col gap-1.5">
                                                {student.courses.map(c => (
                                                    <span key={c.course_id} className="inline-flex items-center w-fit px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                                                        {c.course_title}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 bg-gray-100 rounded-full h-2 max-w-[120px] shadow-inner overflow-hidden">
                                                    <div
                                                        className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full rounded-full"
                                                        style={{ width: `${student.total_progress}%` }}
                                                    />
                                                </div>
                                                <span className="text-sm font-bold text-gray-700 w-10">{Math.round(student.total_progress)}%</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-sm font-medium text-gray-500">
                                            {student.last_active ? new Date(student.last_active).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredStudents.length === 0 && (
                        <div className="text-center py-20 text-gray-500">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                                <Users className="w-10 h-10 text-gray-300" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">No students found</h3>
                            <p>Try adjusting your search or filters</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
