import { useState, useEffect } from 'react';
import { Users, Search, TrendingUp, Award, Clock, Mail } from 'lucide-react';
import api from '../../../lib/axios';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

interface EnrolledStudentsTabProps {
    courseData: any;
}

export const EnrolledStudentsTab = ({ courseData }: EnrolledStudentsTabProps) => {
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (courseData?.course?.id) {
            fetchStudents();
        }
    }, [courseData]);

    const fetchStudents = async () => {
        try {
            const response = await api.get(`/enrollments/course/${courseData.course.id}`);
            setStudents(response.data);
        } catch (error) {
            console.error('Failed to fetch students:', error);
            toast.error('Failed to load students');
        } finally {
            setLoading(false);
        }
    };

    const filteredStudents = students.filter(student =>
        student.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    const stats = courseData?.statistics || {};

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl shadow-xl p-6 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold mb-2">Enrolled Students</h2>
                        <p className="text-blue-100">Track and manage all students enrolled in this course</p>
                    </div>
                    <div className="text-right">
                        <div className="text-4xl font-bold">{students.length}</div>
                        <div className="text-blue-100">Total Students</div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900">{students.length}</div>
                            <div className="text-sm text-gray-600">Total Enrolled</div>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-50 rounded-lg">
                            <TrendingUp className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900">{stats.active_students || 0}</div>
                            <div className="text-sm text-gray-600">Active Students</div>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-50 rounded-lg">
                            <Award className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900">
                                {students.filter(s => s.progress_percent >= 100).length}
                            </div>
                            <div className="text-sm text-gray-600">Completed</div>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-amber-50 rounded-lg">
                            <Clock className="w-6 h-6 text-amber-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900">
                                {stats.recent_enrollments_7d || 0}
                            </div>
                            <div className="text-sm text-gray-600">This Week</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search students by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                </div>
            </div>

            {/* Students List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900">Student List</h3>
                </div>

                {filteredStudents.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                        <p>No students found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Student
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Progress
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Enrolled
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredStudents.map((enrollment) => (
                                    <tr key={enrollment.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                                                    {enrollment.user?.full_name?.charAt(0).toUpperCase() || 'U'}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-gray-900">
                                                        {enrollment.user?.full_name || 'Unknown User'}
                                                    </div>
                                                    <div className="flex items-center gap-3 text-sm text-gray-500">
                                                        <span className="flex items-center gap-1">
                                                            <Mail className="w-3 h-3" />
                                                            {enrollment.user?.email || 'N/A'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-xs">
                                                    <div
                                                        className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all"
                                                        style={{ width: `${Math.min(enrollment.progress_percent || 0, 100)}%` }}
                                                    />
                                                </div>
                                                <span className="text-sm font-semibold text-gray-900 min-w-[3rem]">
                                                    {Math.round(enrollment.progress_percent || 0)}%
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {enrollment.enrolled_at
                                                ? formatDistanceToNow(new Date(enrollment.enrolled_at), { addSuffix: true })
                                                : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-semibold ${enrollment.progress_percent >= 100
                                                    ? 'bg-green-100 text-green-700'
                                                    : enrollment.progress_percent > 0
                                                        ? 'bg-blue-100 text-blue-700'
                                                        : 'bg-gray-100 text-gray-700'
                                                    }`}
                                            >
                                                {enrollment.progress_percent >= 100
                                                    ? 'Completed'
                                                    : enrollment.progress_percent > 0
                                                        ? 'In Progress'
                                                        : 'Not Started'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};
