import { useState, useEffect } from 'react';
import { NavLink, useParams, useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
    LayoutDashboard,
    BookOpen,
    Users,
    MessageSquare,
    Bell,
    LogOut,
    HelpCircle,
    PlusCircle,
    ArrowLeft
} from 'lucide-react';
import { DeleteConfirmationModal } from '../common/DeleteConfirmationModal';
import { useAuthStore } from '../../store/auth.store';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import { useSidebarStore } from '../../store/sidebar.store';

export const CourseContextLayout = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuthStore();
    const { setCustomSidebarContent } = useSidebarStore();

    const [showUnenrollModal, setShowUnenrollModal] = useState(false);
    const [isUnenrolling, setIsUnenrolling] = useState(false);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user && id) {
            checkEnrollmentStatus();
        }
    }, [user, id]);

    // Update sidebar content whenever state changes
    useEffect(() => {
        const navigationItems = [
            { icon: LayoutDashboard, label: 'Overview', path: `/courses/${id}`, public: true },
            { icon: Bell, label: 'Announcements', path: `/courses/${id}/announcements`, public: true },
            { icon: BookOpen, label: 'Content', path: `/courses/${id}/content`, public: false },
            { icon: Users, label: 'Instructors', path: `/courses/${id}/instructors`, public: true },
            { icon: MessageSquare, label: 'Reviews', path: `/courses/${id}/reviews`, public: true },
            { icon: HelpCircle, label: 'Course Community', path: `/community/course/${id}/qa`, public: false },
        ];

        const SidebarContent = (
            <div className="space-y-6 px-3">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/courses')}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all font-medium"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm">Back to Catalog</span>
                </button>

                <div>
                    <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 px-3">
                        Course Navigation
                    </h3>
                    <nav className="space-y-1.5">
                        {navigationItems.map((item) => {
                            if (!item.public && (isLoading || !isEnrolled)) return null;

                            const isActive = location.pathname === item.path;
                            return (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    end={item.path === `/courses/${id}`}
                                    className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${isActive
                                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 shadow-sm font-semibold'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 font-medium'
                                        }`}
                                >
                                    <item.icon className={`h-5 w-5 transition-colors ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`} />
                                    <span className="text-sm">{item.label}</span>
                                    {isActive && (
                                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-600 dark:bg-primary-400" />
                                    )}
                                </NavLink>
                            );
                        })}
                    </nav>

                    {user && !isLoading && (
                        <>
                            <div className="my-4 border-t border-gray-200 dark:border-gray-800" />
                            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 px-3">
                                Actions
                            </h3>

                            {/* Student Actions */}
                            {user.role === 'student' && (
                                isEnrolled ? (
                                    <button
                                        onClick={() => setShowUnenrollModal(true)}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
                                    >
                                        <LogOut className="w-5 h-5" />
                                        Unenroll Course
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleEnroll}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-200"
                                    >
                                        <PlusCircle className="w-5 h-5" />
                                        Enroll Now
                                    </button>
                                )
                            )}
                        </>
                    )}
                </div>
            </div>
        );

        setCustomSidebarContent(SidebarContent);

        return () => setCustomSidebarContent(null);
    }, [id, user, isLoading, isEnrolled, navigate, setCustomSidebarContent]);

    const checkEnrollmentStatus = async () => {
        if (user?.role === 'admin' || user?.role === 'instructor') {
            setIsEnrolled(true);
            setIsLoading(false);
            return;
        }

        try {
            const response = await api.get('/enrollments/me');
            const enrolled = response.data.some((enrollment: any) => enrollment.course.id === Number(id));
            setIsEnrolled(enrolled);
        } catch (error) {
            console.error('Failed to check enrollment:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUnenroll = async () => {
        setIsUnenrolling(true);
        try {
            const response = await api.get('/enrollments/me');
            const enrollment = response.data.find((e: any) => e.course.id === Number(id));

            if (enrollment) {
                await api.delete(`/enrollments/${enrollment.id}`);
                toast.success('Successfully unenrolled from course');
                setIsEnrolled(false);
                navigate('/courses');
            }
        } catch (error) {
            toast.error('Failed to unenroll');
        } finally {
            setIsUnenrolling(false);
            setShowUnenrollModal(false);
        }
    };

    const handleEnroll = async () => {
        try {
            await api.post('/enrollments/', { course_id: Number(id) });
            toast.success('Successfully enrolled!');
            setIsEnrolled(true);
        } catch (error) {
            toast.error('Failed to enroll');
        }
    };

    return (
        <>
            <Outlet />
            <DeleteConfirmationModal
                isOpen={showUnenrollModal}
                onClose={() => setShowUnenrollModal(false)}
                onConfirm={handleUnenroll}
                title="Unenroll from Course"
                message="Are you sure you want to unenroll? You will lose access to all course progress and materials."
                confirmText="Unenroll"
                loading={isUnenrolling}
            />
        </>
    );
};
