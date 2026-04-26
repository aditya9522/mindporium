import { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service';
import { courseService } from '../../services/course.service';
import { Search, BookOpen, Eye, BarChart3, Activity, Users, Star, DollarSign, Delete, Plus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { getImageUrl } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';
import { DeleteConfirmationModal } from '../../components/common/DeleteConfirmationModal';
import { CardGridSkeleton } from '../../components/ui/CardGridSkeleton';

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



    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-purple-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-purple-900/20 py-8 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                            Course Management
                        </h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">Oversee and manage all platform courses with advanced analytics.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/admin/courses/create')}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-500/20"
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
                                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full sm:w-64 shadow-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* Premium Course Cards Grid */}
                {loading ? (
                    <CardGridSkeleton count={6} />
                ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCourses.map((course) => (
                        <div
                            key={course.id}
                            className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-slate-200 dark:border-gray-800 overflow-hidden hover:shadow-lg transition-all duration-300 group"
                        >
                            <div className="flex flex-col h-full">
                                {/* Header / Thumbnail Area */}
                                <div className="relative h-48 bg-slate-900 dark:bg-black overflow-hidden">
                                    {course.thumbnail ? (
                                        <img
                                            src={getImageUrl(course.thumbnail)}
                                            alt={course.title}
                                            className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-violet-600">
                                            <BookOpen className="w-12 h-12 text-white/50" />
                                        </div>
                                    )}
                                    <div className="absolute top-3 right-3 flex gap-2">
                                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold backdrop-blur-md shadow-sm border ${course.is_published
                                            ? 'bg-emerald-500/90 border-emerald-400 text-white'
                                            : 'bg-amber-500/90 border-amber-400 text-white'
                                            }`}>
                                            {course.is_published ? 'Published' : 'Draft'}
                                        </span>
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent">
                                        <h3 className="text-lg font-bold text-white line-clamp-1 group-hover:text-indigo-200 transition-colors">
                                            {course.title}
                                        </h3>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-300 font-medium">
                                            <span className="uppercase tracking-wider">{course.level}</span>
                                            <span className="w-1 h-1 bg-slate-400 rounded-full" />
                                            <span>{course.category}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Body */}
                                <div className="p-5 flex-1 flex flex-col">
                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-3 gap-3 mb-6">
                                        <div className="bg-slate-50 dark:bg-gray-800 border border-slate-100 dark:border-gray-700 rounded-lg p-2 text-center">
                                            <div className="flex items-center justify-center gap-1.5 text-slate-500 dark:text-gray-400 text-[10px] uppercase font-bold tracking-wide mb-1">
                                                <Users className="w-3 h-3" /> Students
                                            </div>
                                            <div className="font-bold text-slate-900 dark:text-gray-100">{course.enrollments_count || 0}</div>
                                        </div>
                                        <div className="bg-slate-50 dark:bg-gray-800 border border-slate-100 dark:border-gray-700 rounded-lg p-2 text-center">
                                            <div className="flex items-center justify-center gap-1.5 text-slate-500 dark:text-gray-400 text-[10px] uppercase font-bold tracking-wide mb-1">
                                                <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> Rating
                                            </div>
                                            <div className="font-bold text-slate-900 dark:text-gray-100">{course.rating ? course.rating.toFixed(1) : '-'}</div>
                                        </div>
                                        <div className="bg-slate-50 dark:bg-gray-800 border border-slate-100 dark:border-gray-700 rounded-lg p-2 text-center">
                                            <div className="flex items-center justify-center gap-1.5 text-slate-500 dark:text-gray-400 text-[10px] uppercase font-bold tracking-wide mb-1">
                                                <DollarSign className="w-3 h-3 text-emerald-500" /> Price
                                            </div>
                                            <div className="font-bold text-slate-900 dark:text-gray-100">{course.price > 0 ? `$${course.price}` : 'Free'}</div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="grid grid-cols-2 gap-2 mt-auto">
                                        <button
                                            onClick={() => navigate(`/admin/courses/${course.id}/view`)}
                                            className="col-span-2 flex items-center justify-center gap-2 px-3 py-2 bg-slate-900 dark:bg-indigo-600 text-white rounded-lg hover:bg-slate-800 dark:hover:bg-indigo-700 transition-colors text-xs font-semibold"
                                        >
                                            <Eye className="w-3.5 h-3.5" /> View Details
                                        </button>
                                        <button
                                            onClick={() => navigate(`/admin/courses/${course.id}/analytics`)}
                                            className="flex items-center justify-center gap-1.5 px-3 py-1.5 border border-slate-200 dark:border-gray-700 text-slate-600 dark:text-gray-300 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-100 dark:hover:border-indigo-800 transition-colors text-xs font-medium"
                                        >
                                            <BarChart3 className="w-3.5 h-3.5" /> Analytics
                                        </button>
                                        <button
                                            onClick={() => navigate(`/admin/courses/${course.id}/monitoring`)}
                                            className="flex items-center justify-center gap-1.5 px-3 py-1.5 border border-slate-200 dark:border-gray-700 text-slate-600 dark:text-gray-300 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-100 dark:hover:border-emerald-800 transition-colors text-xs font-medium"
                                        >
                                            <Activity className="w-3.5 h-3.5" /> Monitor
                                        </button>
                                    </div>

                                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-gray-800 flex items-center justify-between">
                                        <span className="text-[10px] font-medium text-slate-400 dark:text-gray-500">
                                            Updated {course.updated_at ? formatDistanceToNow(new Date(course.updated_at)) : 'recently'} ago
                                        </span>
                                        <div className="flex gap-1">
                                            {/* Additional minimal actions if needed */}
                                            <button
                                                onClick={() => setDeleteModal({ isOpen: true, course })}
                                                className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                                                title="Delete Course"
                                            >
                                                <Delete className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                )}

                {filteredCourses.length === 0 && (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-gray-600" />
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
