import { useState, useEffect } from 'react';
// import { useAuthStore } from '../../store/auth.store';
import { Loader2, Search, Users, BookOpen, TrendingUp, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/axios';

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
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">My Students</h1>
                    <p className="mt-2 text-gray-600">Track student progress across all your courses</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Students</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{students.length}</p>
                            </div>
                            <div className="p-3 bg-blue-50 rounded-lg">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Active Courses</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{courses.length}</p>
                            </div>
                            <div className="p-3 bg-indigo-50 rounded-lg">
                                <BookOpen className="w-6 h-6 text-indigo-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Avg. Progress</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">
                                    {students.length > 0
                                        ? Math.round(students.reduce((sum, s) => sum + s.total_progress, 0) / students.length)
                                        : 0}%
                                </p>
                            </div>
                            <div className="p-3 bg-green-50 rounded-lg">
                                <TrendingUp className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search students..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>
                        <select
                            value={selectedCourse}
                            onChange={(e) => setSelectedCourse(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                            <option value="all">All Courses</option>
                            {courses.map(course => (
                                <option key={course.id} value={course.id}>{course.title}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Students List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Enrolled Courses</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Avg. Progress</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Active</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredStudents.map((student) => (
                                    <tr key={student.user_id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                                                    {student.full_name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="ml-3">
                                                    <p className="font-medium text-gray-900">{student.full_name}</p>
                                                    <p className="text-sm text-gray-500 flex items-center gap-1">
                                                        <Mail className="w-3 h-3" />
                                                        {student.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-700">{student.enrolled_courses}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                                                    <div
                                                        className="bg-indigo-600 h-2 rounded-full"
                                                        style={{ width: `${student.total_progress}%` }}
                                                    />
                                                </div>
                                                <span className="text-sm font-medium text-gray-700">{Math.round(student.total_progress)}%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {student.last_active ? new Date(student.last_active).toLocaleDateString() : 'N/A'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredStudents.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                            <p>No students found</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
