import { useEffect, useState } from 'react';
import { courseService } from '../../services/course.service';
import type { Course } from '../../types/course';
import { CourseManagementCard } from '../../components/instructor/CourseManagementCard';
import { StatsCard } from '../../components/instructor/StatsCard';
import { Plus, Search, Filter, BookOpen, BarChart2, TrendingUp, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { DeleteConfirmationModal } from '../../components/common/DeleteConfirmationModal';
import { useAuthStore } from '../../store/auth.store';

export const MyCoursesPage = () => {
    // const navigate = useNavigate();
    const { user } = useAuthStore();
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');

    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; courseId: number | null }>({
        isOpen: false,
        courseId: null
    });
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const data = await courseService.getMyCourses({});
            setCourses(data);
        } catch (error) {
            console.error('Failed to fetch courses:', error);
            toast.error('Failed to load courses');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (courseId: number) => {
        const course = courses.find(c => c.id === courseId);
        if (!course || Number(course.created_by) !== Number(user?.id)) {
            toast.error('Only the course creator can delete this course');
            return;
        }
        setDeleteModal({ isOpen: true, courseId });
    };

    const handleDeleteConfirm = async () => {
        if (!deleteModal.courseId) return;
        setDeleting(true);
        try {
            await courseService.deleteCourse(deleteModal.courseId);
            setCourses(courses.filter(c => c.id !== deleteModal.courseId));
            toast.success('Course deleted successfully');
            setDeleteModal({ isOpen: false, courseId: null });
        } catch (error) {
            console.error('Failed to delete course:', error);
            toast.error('Failed to delete course');
        } finally {
            setDeleting(false);
        }
    };

    const filteredCourses = courses.filter(course => {
        const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (course.description?.toLowerCase() || '').includes(searchQuery.toLowerCase());

        const isPublished = !!course.is_published;

        const matchesStatus = filterStatus === 'all' ||
            (filterStatus === 'published' && isPublished) ||
            (filterStatus === 'draft' && !isPublished);

        return matchesSearch && matchesStatus;
    });

    const totalStudents = courses.reduce((acc, course) => acc + (course.enrollments_count || 0), 0); // Assuming enrollments_count exists or 0

    if (loading) return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
                    <div className="space-y-2">
                        <div className="w-64 h-10 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                        <div className="w-96 h-5 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-32 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 animate-pulse p-6">
                            <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-800 rounded mb-4" />
                            <div className="h-8 w-1/3 bg-gray-200 dark:bg-gray-800 rounded" />
                        </div>
                    ))}
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-4 mb-8 h-20 animate-pulse" />

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col h-[380px] animate-pulse">
                            <div className="h-48 bg-gray-200 dark:bg-gray-800 w-full shrink-0" />
                            <div className="p-6 flex-1 flex flex-col">
                                <div className="h-6 bg-gray-200 dark:bg-gray-800 w-3/4 rounded mb-3" />
                                <div className="flex gap-2 mb-4">
                                    <div className="w-16 h-5 bg-gray-200 dark:bg-gray-800 rounded-full" />
                                    <div className="w-20 h-5 bg-gray-200 dark:bg-gray-800 rounded-full" />
                                </div>
                                <div className="mt-auto flex justify-between">
                                    <div className="w-1/3 h-4 bg-gray-200 dark:bg-gray-800 rounded" />
                                    <div className="w-1/3 h-4 bg-gray-200 dark:bg-gray-800 rounded" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header & Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
                    <div className="text-center md:text-left">
                        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-gray-900 to-primary-600 dark:from-gray-100 dark:to-primary-400 tracking-tight mb-2">My Courses</h1>
                        <p className="text-lg text-gray-500 dark:text-gray-400 font-medium">Manage your course content, student progress, and analytics</p>
                    </div>
                    <div className="flex items-center justify-center md:justify-end gap-3">
                        <Link
                            to="/instructor/analytics"
                            className="inline-flex items-center px-5 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm text-sm font-bold text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-all hover:-translate-y-0.5"
                        >
                            <BarChart2 className="w-4 h-4 mr-2" />
                            Analytics
                        </Link>
                        <Link
                            to="/instructor/courses/create"
                            className="inline-flex items-center px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all font-bold shadow-lg shadow-primary-200 dark:shadow-primary-900/30 hover:shadow-primary-300 dark:hover:shadow-primary-800/50 hover:-translate-y-0.5"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Create New Course
                        </Link>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    <StatsCard
                        title="Total Courses"
                        value={courses.length}
                        icon={BookOpen}
                        color="blue"
                    />
                    <StatsCard
                        title="Active Students"
                        value={totalStudents}
                        icon={Users}
                        color="green"
                    />
                    <StatsCard
                        title="Published"
                        value={courses.filter(c => c.is_published).length}
                        icon={TrendingUp}
                        color="purple"
                    />
                    <StatsCard
                        title="Drafts"
                        value={courses.filter(c => !c.is_published).length}
                        icon={Filter}
                        color="orange"
                    />
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-4 mb-8 transition-colors duration-300">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search your courses..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 dark:focus:border-primary-400 transition-all outline-none text-gray-700 dark:text-gray-300 bg-gray-50/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 focus:bg-white dark:focus:bg-gray-800 font-medium"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="relative w-full md:w-auto">
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value as any)}
                                    className="w-full md:w-auto pl-4 pr-10 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 dark:focus:border-primary-400 appearance-none bg-white dark:bg-gray-900 min-w-[160px] font-medium text-gray-700 dark:text-gray-300 cursor-pointer hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                                >
                                    <option value="all">All Status</option>
                                    <option value="published">Published</option>
                                    <option value="draft">Draft</option>
                                </select>
                                <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Courses Grid */}
                {filteredCourses.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredCourses.map((course) => (
                            <CourseManagementCard
                                key={course.id}
                                course={course}
                                enrollmentCount={course.enrollments_count || 0}
                                onDelete={handleDeleteClick}
                                canDelete={Number(course.created_by) === Number(user?.id)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-24 bg-white dark:bg-gray-900 rounded-2xl shadow-[0_2px_15px_rgb(0,0,0,0.04)] dark:shadow-[0_2px_15px_rgb(0,0,0,0.2)] border border-gray-100 dark:border-gray-800 transition-colors duration-300">
                        <div className="bg-primary-50 dark:bg-primary-900/30 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 border border-primary-100 dark:border-primary-800">
                            <BookOpen className="w-10 h-10 text-primary-500 dark:text-primary-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                            {searchQuery || filterStatus !== 'all'
                                ? 'No courses found'
                                : 'Start your teaching journey'}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto text-lg">
                            {searchQuery || filterStatus !== 'all'
                                ? 'Try adjusting your search or filters to find what you are looking for.'
                                : 'Create your first course to begin sharing your knowledge with students.'}
                        </p>
                        {!searchQuery && filterStatus === 'all' && (
                            <Link
                                to="/instructor/courses/create"
                                className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-bold rounded-xl shadow-lg text-white bg-linear-to-r from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 transition-all hover:scale-105 hover:shadow-primary-500/25 dark:hover:shadow-primary-800/50"
                            >
                                <Plus className="w-6 h-6 mr-2" />
                                Create Your First Course
                            </Link>
                        )}
                    </div>
                )}
            </div>
            <DeleteConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, courseId: null })}
                onConfirm={handleDeleteConfirm}
                title="Delete Course"
                message="Are you sure you want to delete this course? This action cannot be undone."
                loading={deleting}
            />
        </div>
    );
};
