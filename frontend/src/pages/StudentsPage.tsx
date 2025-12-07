import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Search, Filter, Mail, BookOpen, Award, Loader2, TrendingUp } from 'lucide-react';
import { Button } from '../components/ui/Button';
import api from '../lib/axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/auth.store';

interface Student {
    id: number;
    full_name: string;
    email: string;
    photo?: string;
    enrolled_courses?: number;
    completed_courses?: number;
    average_grade?: number;
    created_at: string;
}

export const StudentsPage = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'name' | 'courses' | 'grade'>('name');

    // Check if user has permission to view students
    useEffect(() => {
        if (user && user.role !== 'admin' && user.role !== 'instructor') {
            toast.error('You do not have permission to view this page');
            navigate('/unauthorized');
        }
    }, [user, navigate]);

    useEffect(() => {
        if (user && (user.role === 'admin' || user.role === 'instructor')) {
            loadStudents();
        }
    }, [user]);

    const loadStudents = async () => {
        try {
            const response = await api.get('/users/students');
            setStudents(response.data);
        } catch (error) {
            console.error('Failed to load students:', error);
            toast.error('Failed to load students');
        } finally {
            setLoading(false);
        }
    };

    const filteredStudents = students
        .filter(student =>
            student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.email.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.full_name.localeCompare(b.full_name);
                case 'courses':
                    return (b.enrolled_courses || 0) - (a.enrolled_courses || 0);
                case 'grade':
                    return (b.average_grade || 0) - (a.average_grade || 0);
                default:
                    return 0;
            }
        });

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-indigo-100 rounded-xl">
                            <Users className="w-8 h-8 text-indigo-600" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Students</h1>
                            <p className="text-gray-600">Manage and view all enrolled students</p>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Total Students</p>
                                    <p className="text-2xl font-bold text-gray-900">{students.length}</p>
                                </div>
                                <Users className="w-8 h-8 text-indigo-600 opacity-20" />
                            </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Active This Month</p>
                                    <p className="text-2xl font-bold text-gray-900">{Math.floor(students.length * 0.75)}</p>
                                </div>
                                <TrendingUp className="w-8 h-8 text-green-600 opacity-20" />
                            </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Avg. Courses/Student</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {students.length > 0
                                            ? (students.reduce((sum, s) => sum + (s.enrolled_courses || 0), 0) / students.length).toFixed(1)
                                            : '0'}
                                    </p>
                                </div>
                                <BookOpen className="w-8 h-8 text-blue-600 opacity-20" />
                            </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Avg. Grade</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {students.length > 0
                                            ? (students.reduce((sum, s) => sum + (s.average_grade || 0), 0) / students.length).toFixed(1)
                                            : '0'}%
                                    </p>
                                </div>
                                <Award className="w-8 h-8 text-yellow-600 opacity-20" />
                            </div>
                        </div>
                    </div>

                    {/* Search and Filter */}
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search students by name or email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Filter className="w-5 h-5 text-gray-400" />
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as any)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                >
                                    <option value="name">Sort by Name</option>
                                    <option value="courses">Sort by Courses</option>
                                    <option value="grade">Sort by Grade</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Students List */}
                {filteredStudents.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                        <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No students found</h3>
                        <p className="text-gray-600">
                            {searchTerm ? 'Try adjusting your search criteria' : 'No students have enrolled yet'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredStudents.map((student) => (
                            <div
                                key={student.id}
                                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all group"
                            >
                                <div className="h-24 bg-gradient-to-r from-indigo-500 to-purple-600 relative">
                                    <div className="absolute -bottom-10 left-6">
                                        <div className="w-20 h-20 rounded-full bg-white p-1 shadow-lg">
                                            {student.photo ? (
                                                <img
                                                    src={student.photo}
                                                    alt={student.full_name}
                                                    className="w-full h-full object-cover rounded-full"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-xl font-bold">
                                                    {student.full_name.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-12 px-6 pb-6">
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">{student.full_name}</h3>
                                    <div className="flex items-center gap-1 text-sm text-gray-600 mb-4">
                                        <Mail className="w-4 h-4" />
                                        <span className="truncate">{student.email}</span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                                            <p className="text-2xl font-bold text-indigo-600">{student.enrolled_courses || 0}</p>
                                            <p className="text-xs text-gray-600">Courses</p>
                                        </div>
                                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                                            <p className="text-2xl font-bold text-green-600">{student.average_grade || 0}%</p>
                                            <p className="text-xs text-gray-600">Avg Grade</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => navigate(`/admin/users/${student.id}`)}
                                        >
                                            View Profile
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => window.location.href = `mailto:${student.email}`}
                                        >
                                            <Mail className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
