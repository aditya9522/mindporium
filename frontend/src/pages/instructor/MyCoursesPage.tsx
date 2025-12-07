import { useEffect, useState } from 'react';
import { courseService } from '../../services/course.service';
import type { Course } from '../../types/course';
import { CourseManagementCard } from '../../components/instructor/CourseManagementCard';
import { StatsCard } from '../../components/instructor/StatsCard';
import { Plus, Search, Filter, Loader2, BookOpen, BarChart2, TrendingUp, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { DeleteConfirmationModal } from '../../components/modals/DeleteConfirmationModal';

export const MyCoursesPage = () => {
    // const navigate = useNavigate();
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
            course.description?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = filterStatus === 'all' ||
            (filterStatus === 'published' && course.is_published) ||
            (filterStatus === 'draft' && !course.is_published);

        return matchesSearch && matchesStatus;
    });

    const totalStudents = courses.reduce((acc, course) => acc + (course.enrollments_count || 0), 0); // Assuming enrollments_count exists or 0

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
                {/* Header & Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
                        <p className="mt-2 text-gray-600">Manage your course content, student progress, and analytics.</p>
                    </div>
                    <div className="mt-4 md:mt-0 flex gap-3">
                        <Link
                            to="/instructor/analytics"
                            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                        >
                            <BarChart2 className="w-4 h-4 mr-2" />
                            Analytics
                        </Link>
                        <Link
                            to="/instructor/courses/create"
                            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-sm"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Create New Course
                        </Link>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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

                {/* Sub-navigation / additional links placeholder */}
                <div className="border-b border-gray-200 mb-6">
                    <nav className="-mb-px flex space-x-8">
                        <Link to="#" className="border-indigo-500 text-indigo-600 whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm">
                            Courses
                        </Link>
                        {/* These are placeholders for future pages as requested */}
                        <Link to="#" className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm">
                            Performance
                        </Link>
                        <Link to="#" className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm">
                            Progress
                        </Link>
                    </nav>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search your courses..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500 hidden sm:block">Filter by:</span>
                            <div className="relative">
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value as any)}
                                    className="pl-3 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white min-w-[120px]"
                                >
                                    <option value="all">All Status</option>
                                    <option value="published">Published</option>
                                    <option value="draft">Draft</option>
                                </select>
                                <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Courses Grid */}
                {filteredCourses.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCourses.map((course) => (
                            <CourseManagementCard
                                key={course.id}
                                course={course}
                                enrollmentCount={course.enrollments_count || 0}
                                onDelete={handleDeleteClick}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="bg-indigo-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Plus className="w-10 h-10 text-indigo-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {searchQuery || filterStatus !== 'all'
                                ? 'No courses found'
                                : 'Start your teaching journey'}
                        </h3>
                        <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                            {searchQuery || filterStatus !== 'all'
                                ? 'Try adjusting your search or filters to find what you are looking for.'
                                : 'Create your first course to begin sharing your knowledge with students.'}
                        </p>
                        {!searchQuery && filterStatus === 'all' && (
                            <Link
                                to="/instructor/courses/create"
                                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-all hover:scale-105"
                            >
                                <Plus className="w-5 h-5 mr-2" />
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
