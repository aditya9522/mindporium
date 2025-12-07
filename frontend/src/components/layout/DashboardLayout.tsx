import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { useSidebarStore } from '../../store/sidebar.store';
import { Navbar } from '../layout/Navbar';
import { Home, BookOpen, Users, Settings, BarChart3, Shield, GraduationCap, Bot, FileText, Video, MessageSquare, Megaphone, User, Bell, Calendar } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export const DashboardLayout = () => {
    const { isAuthenticated, checkAuth, isLoading, user } = useAuthStore();
    const { isOpen: isSidebarOpen } = useSidebarStore();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            navigate('/login');
        }
    }, [isLoading, isAuthenticated, navigate]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    // Role-based menu items
    const getMenuItems = () => {
        if (user?.role === 'admin') {
            return [
                { icon: Home, label: 'Dashboard', path: '/admin/dashboard' },
                { icon: Users, label: 'Users', path: '/admin/users' },
                { icon: GraduationCap, label: 'Instructors', path: '/admin/instructors' },
                { icon: BookOpen, label: 'Courses', path: '/admin/courses' },
                { icon: Megaphone, label: 'Announcements', path: '/admin/announcements' },
                { icon: Shield, label: 'System', path: '/admin/system' },
                { icon: MessageSquare, label: 'Feedback', path: '/admin/feedback' },
                { icon: Users, label: 'Community', path: '/community' },
                { icon: Bot, label: 'AI Assistant', path: '/chatbot' },
                { icon: Settings, label: 'Settings', path: '/settings' },
            ];
        }

        if (user?.role === 'instructor') {
            return [
                { icon: Home, label: 'Dashboard', path: '/instructor/dashboard' },
                { icon: BookOpen, label: 'My Courses', path: '/instructor/courses' },
                { icon: Users, label: 'Students', path: '/instructor/students' },
                { icon: FileText, label: 'Tests', path: '/instructor/tests' },
                { icon: Video, label: 'Classrooms', path: '/classrooms' },
                { icon: Calendar, label: 'Attendance', path: '/instructor/attendance' },
                { icon: Users, label: 'Community', path: '/community' },
                { icon: BarChart3, label: 'Analytics', path: '/instructor/analytics' },
                { icon: MessageSquare, label: 'Feedback', path: '/instructor/feedback' },
                { icon: User, label: 'My Profile', path: '/instructor/profile' },
                { icon: Bot, label: 'AI Assistant', path: '/chatbot' },
                { icon: Settings, label: 'Settings', path: '/settings' },
            ];
        }
        // Student menu
        return [
            { icon: Home, label: 'Dashboard', path: '/dashboard' },
            { icon: BookOpen, label: 'Browse Courses', path: '/courses' },
            { icon: BookOpen, label: 'My Learning', path: '/my-learning' },
            { icon: FileText, label: 'Tests', path: '/tests' },
            { icon: Video, label: 'Classrooms', path: '/classrooms' },
            { icon: Calendar, label: 'My Attendance', path: '/student/attendance' },
            { icon: Users, label: 'Community', path: '/community' },
            { icon: GraduationCap, label: 'Instructors', path: '/instructors' },
            { icon: MessageSquare, label: 'Feedback', path: '/feedback' },
            { icon: Bell, label: 'Notifications', path: '/notifications' },
            { icon: Bot, label: 'AI Assistant', path: '/chatbot' },
            { icon: Settings, label: 'Settings', path: '/settings' },
        ];
    };

    const menuItems = getMenuItems();

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <div className="flex flex-1">
                {/* Sidebar */}
                {isSidebarOpen && (
                    <aside className="hidden lg:block w-64 bg-white border-r border-gray-200 transition-all duration-300">
                        <div className="p-6">
                            <div className="mb-6">
                                <div className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg">
                                    {user?.photo ? (
                                        <img
                                            src={user.photo}
                                            alt={user.full_name}
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                                            <span className="text-primary-600 font-semibold">
                                                {user?.full_name?.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {user?.full_name}
                                        </p>
                                        <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                                    </div>
                                </div>
                            </div>

                            <nav className="space-y-1">
                                {menuItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = location.pathname === item.path;
                                    return (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive
                                                ? 'bg-primary-50 text-primary-600'
                                                : 'text-gray-700 hover:bg-gray-50'
                                                }`}
                                        >
                                            <Icon className="h-5 w-5" />
                                            <span className="text-sm font-medium">{item.label}</span>
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>
                    </aside>
                )}

                <main className="flex-1 p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};
