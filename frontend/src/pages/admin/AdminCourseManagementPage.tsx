import { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service';
import { courseService } from '../../services/course.service';
import { Loader2, Search, BookOpen, Eye, BarChart3, Activity, TrendingUp, Users, Star, DollarSign, Delete, Plus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { DeleteConfirmationModal } from '../../components/modals/DeleteConfirmationModal';

export const AdminCourseManagementPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [courses, setCourses] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; course: any | null }>({
        isOpen: false,
        course: null
    });
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const data = await adminService.getAllCourses();
            setCourses(data);
        } catch (error) {
            console.error('Failed to fetch courses:', error);
            toast.error('Failed to load courses');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCourse = async () => {
        if (!deleteModal.course) return;

        setDeleting(true);
        try {
            await courseService.deleteCourse(deleteModal.course.id);
            setCourses(courses.filter(c => c.id !== deleteModal.course.id));
            toast.success('Course deleted successfully');
            setDeleteModal({ isOpen: false, course: null });
        } catch (error) {
            console.error('Failed to delete course:', error);
            toast.error('Failed to delete course');
        } finally {
            setDeleting(false);
        }
    };

    const filteredCourses = courses.filter(course =>
        course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-purple-50/30 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            Course Management
                        </h1>
                        <p className="mt-2 text-gray-600">Oversee and manage all platform courses with advanced analytics.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/admin/courses/create')}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                        >
                            <Plus className="w-5 h-5" />
                            Create Course
                        </button>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search courses..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full sm:w-64 shadow-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* Premium Course Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCourses.map((course) => (
                        <div
                            key={course.id}
                            className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:border-indigo-200 transition-all duration-300 transform hover:-translate-y-1"
                        >
                            {/* Course Thumbnail */}
                            <div className="relative h-48 bg-gradient-to-br from-indigo-500 to-purple-600 overflow-hidden">
                                {course.thumbnail ? (
                                    <img
                                        src={course.thumbnail}
                                        alt={course.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <BookOpen className="w-16 h-16 text-white/80" />
                                    </div>
                                )}
                                <div className="absolute top-4 right-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${course.is_published
                                        ? 'bg-green-500/90 text-white'
                                        : 'bg-yellow-500/90 text-white'
                                        }`}>
                                        {course.is_published ? 'Published' : 'Draft'}
                                    </span>
                                </div>
                            </div>

                            {/* Course Content */}
                            <div className="p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                                    {course.title}
                                </h3>
                                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                    {course.description || 'No description available'}
                                </p>

                                {/* Course Meta */}
                                <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                                    <div className="flex items-center gap-2">
                                        <div className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded text-xs font-medium capitalize">
                                            {course.level}
                                        </div>
                                        <div className="px-2 py-1 bg-purple-50 text-purple-600 rounded text-xs font-medium capitalize">
                                            {course.category}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 text-sm font-bold text-emerald-600">
                                        <DollarSign className="w-4 h-4" />
                                        {course.price > 0 ? course.price : 'Free'}
                                    </div>
                                </div>

                                {/* Stats Row */}
                                <div className="grid grid-cols-3 gap-2 mb-4">
                                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                                        <Users className="w-4 h-4 mx-auto text-gray-400 mb-1" />
                                        <p className="text-xs text-gray-500">Students</p>
                                        <p className="text-sm font-bold text-gray-900">-</p>
                                    </div>
                                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                                        <Star className="w-4 h-4 mx-auto text-yellow-400 mb-1" />
                                        <p className="text-xs text-gray-500">Rating</p>
                                        <p className="text-sm font-bold text-gray-900">-</p>
                                    </div>
                                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                                        <BookOpen className="w-4 h-4 mx-auto text-gray-400 mb-1" />
                                        <p className="text-xs text-gray-500">Subjects</p>
                                        <p className="text-sm font-bold text-gray-900">-</p>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="grid grid-cols-2 gap-2 mb-3">
                                    <button
                                        onClick={() => navigate(`/admin/courses/${course.id}/view`)}
                                        className="flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                                    >
                                        <Eye className="w-4 h-4" /> View
                                    </button>
                                    <button
                                        onClick={() => navigate(`/admin/courses/${course.id}/analytics`)}
                                        className="flex items-center justify-center gap-2 px-3 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors text-sm"
                                    >
                                        <BarChart3 className="w-4 h-4" /> Analytics
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => navigate(`/admin/courses/${course.id}/monitoring`)}
                                        className="flex items-center justify-center gap-2 px-3 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors text-sm"
                                    >
                                        <Activity className="w-4 h-4" /> Monitor
                                    </button>
                                    <button
                                        onClick={() => navigate(`/admin/courses/${course.id}/tracking`)}
                                        className="flex items-center justify-center gap-2 px-3 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors text-sm"
                                    >
                                        <TrendingUp className="w-4 h-4" /> Track
                                    </button>
                                </div>

                                {/* Footer */}
                                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                                    <span className="text-xs text-gray-500">
                                        {course.created_at ? formatDistanceToNow(new Date(course.created_at), { addSuffix: true }) : 'N/A'}
                                    </span>
                                    <button
                                        onClick={() => setDeleteModal({ isOpen: true, course })}
                                        className="flex items-center gap-2 text-xs text-red-600 hover:text-red-700 font-medium hover:bg-red-50 px-2 py-1 rounded"
                                    >
                                        <Delete className="w-4 h-4" /> Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredCourses.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                        <p>No courses found matching your search.</p>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, course: null })}
                onConfirm={handleDeleteCourse}
                title="Delete Course"
                message="Are you sure you want to delete this course? All associated data including enrollments, subjects, and resources will be permanently removed."
                itemName={deleteModal.course?.title}
                loading={deleting}
            />
        </div>
    );
};
