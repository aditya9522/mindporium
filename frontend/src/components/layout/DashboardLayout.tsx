import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';

import { useSidebarStore } from '../../store/sidebar.store';
import { PageLoader } from '../common/PageLoader';
import { Navbar } from '../layout/Navbar';
import { Home, BookOpen, Users, Settings, BarChart3, Shield, GraduationCap, Bot, FileText, Video, MessageSquare, Megaphone, User, Bell, Calendar, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { getImageUrl } from '../../lib/utils';

export const DashboardLayout = () => {
    const { isAuthenticated, checkAuth, isLoading, user } = useAuthStore();
    const { isOpen: isSidebarOpen, toggleSidebar, customSidebarContent } = useSidebarStore();
    const navigate = useNavigate();
    const location = useLocation();

    const isPublicRoute = (path: string) => {
        const publicPaths = ['/courses', '/instructors', '/news'];
        return publicPaths.some(p => path.startsWith(p));
    };

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    useEffect(() => {
        if (!isLoading && !isAuthenticated && !isPublicRoute(location.pathname)) {
            navigate('/login');
        }
    }, [isLoading, isAuthenticated, navigate, location.pathname]);

    if (isLoading) {
        return <PageLoader />;
    }

    if (!isAuthenticated && !isPublicRoute(location.pathname)) {
        return null;
    }

    // Role-based menu items
    const getMenuItems = () => {
        if (!user) {
            return [
                { icon: Home, label: 'Home', path: '/' },
                { icon: BookOpen, label: 'Courses', path: '/courses' },
                { icon: GraduationCap, label: 'Instructors', path: '/instructors' },
            ];
        }

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

    const SidebarContent = () => (
        <div className="h-full flex flex-col py-6 bg-white">


            {customSidebarContent ? (
                <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                    {customSidebarContent}
                </div>
            ) : (
                <nav className="space-y-1.5 px-3 flex-1 overflow-y-auto">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => window.innerWidth < 1024 && toggleSidebar()}
                                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${isActive
                                    ? 'bg-indigo-50 text-indigo-700 shadow-sm font-semibold'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium'
                                    }`}
                            >
                                <Icon className={`h-5 w-5 transition-colors ${isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                                <span className="text-sm">{item.label}</span>
                                {isActive && (
                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600" />
                                )}
                            </Link>
                        );
                    })}
                </nav>
            )}

            {/* Profile Section (Bottom) */}
            <div className="mt-auto pt-4 border-t border-gray-100">
                {user ? (
                    <div className="flex items-center gap-3 p-3 mx-3 bg-gray-50 rounded-xl border border-gray-100 group hover:bg-white hover:shadow-md transition-all duration-200 cursor-pointer" onClick={() => navigate('/settings')}>
                        {user.photo ? (
                            <img
                                src={getImageUrl(user.photo)}
                                alt={user.full_name}
                                className="w-10 h-10 rounded-full object-cover ring-2 ring-white group-hover:ring-indigo-100 transition-all"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center ring-2 ring-white group-hover:ring-indigo-100 transition-all">
                                <span className="text-indigo-600 font-bold">
                                    {user.full_name?.charAt(0).toUpperCase()}
                                </span>
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate group-hover:text-indigo-700 transition-colors">
                                {user.full_name}
                            </p>
                            <p className="text-xs text-gray-500 capitalize font-medium">{user.role}</p>
                        </div>
                        <Settings className="w-4 h-4 text-gray-400 group-hover:text-indigo-500 opacity-0 group-hover:opacity-100 transition-all" />
                    </div>
                ) : (
                    <div className="space-y-3 px-3 pb-4">
                        <button
                            onClick={() => navigate('/login')}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-semibold shadow-sm shadow-indigo-200"
                        >
                            Log In
                        </button>
                        <button
                            onClick={() => navigate('/register')}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold"
                        >
                            Sign Up
                        </button>
                    </div>
                )}
            </div>

        </div>
    );

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar showSidebarToggle={true} />
            <div className="flex flex-1 relative">
                {/* Mobile Sidebar Overlay */}
                {isSidebarOpen && (
                    <div className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={toggleSidebar}>
                        <aside className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out" onClick={e => e.stopPropagation()}>
                            <div className="flex justify-end p-2 lg:hidden">
                                <button onClick={toggleSidebar} className="p-2 text-gray-500 hover:text-gray-700"><X className="w-5 h-5" /></button>
                            </div>
                            <SidebarContent />
                        </aside>
                    </div>
                )}

                {/* Desktop Sidebar (Sticky) */}
                {isSidebarOpen && (
                    <aside className="hidden lg:block w-64 bg-white border-r border-gray-200 sticky top-16 h-[calc(100vh-4rem)] overflow-hidden">
                        <SidebarContent />
                    </aside>
                )}

                <main className="flex-1 p-4">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};
