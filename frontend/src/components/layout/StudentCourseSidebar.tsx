import { useState, useEffect } from 'react';
import { NavLink, useParams, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    BookOpen,
    Users,
    MessageSquare,
    Bell,
    LogOut,
    HelpCircle,
    PlusCircle
} from 'lucide-react';
import { DeleteConfirmationModal } from '../modals/DeleteConfirmationModal';
import { useAuthStore } from '../../store/auth.store';
import api from '../../lib/axios';
import toast from 'react-hot-toast';

import { useSidebarStore } from '../../store/sidebar.store';

export const StudentCourseSidebar = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { isOpen } = useSidebarStore();
    const [showUnenrollModal, setShowUnenrollModal] = useState(false);
    const [isUnenrolling, setIsUnenrolling] = useState(false);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user && id) {
            checkEnrollmentStatus();
        }
    }, [user, id]);

    const checkEnrollmentStatus = async () => {
        // Admins and Instructors act as enrolled for navigation access (viewing content)
        // But they don't have "enroll/unenroll" actions usually.
        // If the requirement is strict "Student can only enroll", we flag them as having access but not "isEnrolled" in the student sense?
        // Actually, for sidebar navigation (Content/Q&A), we want them to see it.

        if (user?.role === 'admin' || user?.role === 'instructor') {
            setIsEnrolled(true); // Grants access to restricted tabs
            setIsLoading(false);
            return;
        }

        try {
            // Check if student is enrolled
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
            // Unenroll endpoint might be DELETE /enrollments/{id} or similar.
            // But we don't have the enrollment ID handy unless we fetched detailed list.
            // Assuming we might need to find the enrollment ID first.
            // Or better, if backend supports unenrolling by course ID.
            // For now, let's fetch individual enrollment to get ID if needed, or assume a bulk endpoint.
            // Wait, standard CRUD usually requires ID.

            // Fetch enrollment ID
            const response = await api.get('/enrollments/me');
            const enrollment = response.data.find((e: any) => e.course.id === Number(id));

            if (enrollment) {
                // DELETE /enrollments/{id} doesn't exist in the file view I saw?
                // I saw POST /enrollments, GET /me, GET /progress, GET /course/{id}, POST /resource/complete.
                // DELETE is generic in users.py? No.
                // It seems DELETE enrollment is NOT implemented in enrollments.py!
                // The user asked to "Integrate 'Unenroll Course' Functionality".
                // I need to add DELETE endpoint in enrollments.py!

                // For now, I will comment out the actual API call and show Toast, as I cannot modify backend easily in this step (conceptually).
                // Wait, I can modify backend. I already did for users.py.
                // I should add DELETE endpoint to enrollments.py if missing.
                // I will do that in next step.

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
            // Refresh logic if needed
        } catch (error) {
            toast.error('Failed to enroll');
        }
    };

    const navigationItems = [
        { icon: LayoutDashboard, label: 'Overview', path: `/courses/${id}`, public: true },
        { icon: Bell, label: 'Announcements', path: `/courses/${id}/announcements`, public: true },
        { icon: BookOpen, label: 'Content', path: `/courses/${id}/content`, public: false },
        { icon: Users, label: 'Instructors', path: `/courses/${id}/instructors`, public: true },
        { icon: MessageSquare, label: 'Reviews', path: `/courses/${id}/reviews`, public: true },
        { icon: HelpCircle, label: 'Course Community', path: `/community/course/${id}/qa`, public: false },
    ];

    if (!isOpen) return null;

    return (
        <>
            <div className="w-64 bg-white border-r border-gray-200 h-[calc(100vh-64px)] overflow-y-auto sticky top-16 transition-all duration-300">
                <div className="p-4">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-2">
                        Course Navigation
                    </h3>
                    <nav className="space-y-1">
                        {navigationItems.map((item) => {
                            // Hide restricted items if not enrolled or loading
                            if (!item.public && (isLoading || !isEnrolled)) return null;

                            return (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    end={item.path === `/courses/${id}`}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${isActive
                                            ? 'bg-indigo-50 text-indigo-700'
                                            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                        }`
                                    }
                                >
                                    <item.icon className="w-5 h-5" />
                                    {item.label}
                                </NavLink>
                            );
                        })}
                    </nav>

                    {user && !isLoading && (
                        <>
                            <div className="my-4 border-t border-gray-200" />
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-2">
                                Actions
                            </h3>

                            {/* Student Actions */}
                            {user.role === 'student' && (
                                isEnrolled ? (
                                    <button
                                        onClick={() => setShowUnenrollModal(true)}
                                        className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                        <LogOut className="w-5 h-5" />
                                        Unenroll Course
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleEnroll}
                                        className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-indigo-600 hover:bg-indigo-50 transition-colors"
                                    >
                                        <PlusCircle className="w-5 h-5" />
                                        Enroll Now
                                    </button>
                                )
                            )}

                            {/* Instructor/Admin Actions could go here (e.g. Edit Course) */}
                        </>
                    )}
                </div>
            </div>

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
