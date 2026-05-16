import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';

import { useSidebarStore } from '../../store/sidebar.store';
import { PageLoader } from '../common/PageLoader';
import { Navbar } from '../layout/Navbar';
import { Home, BookOpen, Users, Settings, BarChart3, Shield, GraduationCap, Bot, FileText, Video, MessageSquare, Megaphone, User, Bell, Calendar, X, BriefcaseBusiness } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { getImageUrl } from '../../lib/utils';
import { useThemeStore } from '../../store/theme.store';

export const DashboardLayout = () => {
    const { isAuthenticated, checkAuth, isLoading, user } = useAuthStore();
    const { isOpen: isSidebarOpen, toggleSidebar, customSidebarContent } = useSidebarStore();
    const { } = useThemeStore();
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
                { icon: Home, label: 'Dashboard', path: '/' },
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
                { icon: Video, label: 'Classrooms', path: '/classrooms' },
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
            { icon: BookOpen, label: 'Courses', path: '/courses' },
            { icon: BookOpen, label: 'My Learning', path: '/my-learning' },
            { icon: FileText, label: 'Tests', path: '/tests' },
            { icon: Video, label: 'Classrooms', path: '/classrooms' },
            { icon: Calendar, label: 'Attendance', path: '/student/attendance' },
            { icon: Users, label: 'Community', path: '/community' },
            { icon: GraduationCap, label: 'Instructors', path: '/instructors' },
            { icon: BriefcaseBusiness, label: 'Career Workspace', path: '/career/overview', new: true },
            { icon: MessageSquare, label: 'Feedback', path: '/feedback' },
            { icon: Bell, label: 'Notifications', path: '/notifications' },
            { icon: Bot, label: 'AI Assistant', path: '/chatbot' },
            { icon: Settings, label: 'Settings', path: '/settings' },
        ];
    };

    const menuItems = getMenuItems();

    const SidebarContent = () => (
        <div className="h-full flex flex-col py-0 bg-white dark:bg-gray-900 transition-colors duration-300">
            <div className="h-4" /> {/* Spacer */}


            {customSidebarContent ? (
                <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                    {customSidebarContent}
                </div>
            ) : (
                <nav className="space-y-1.5 px-3 flex-1 overflow-y-auto">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path || (item.path.startsWith('/career') && location.pathname.startsWith('/career'));
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => window.innerWidth < 1024 && toggleSidebar()}
                                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${isActive
                                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 shadow-sm font-semibold'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 font-medium'
                                    }`}
                            >
                                <Icon className={`h-5 w-5 transition-colors ${isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                                <span className="min-w-0 flex-1 truncate text-sm">{item.label}</span>
                                {Boolean((item as any).new) && (
                                    <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                                        New
                                    </span>
                                )}
                                {Boolean((item as any).beta) && (
                                    <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
                                        Beta
                                    </span>
                                )}
                                {isActive && (
                                    <div className="h-1.5 w-1.5 rounded-full bg-primary-600" />
                                )}
                            </Link>
                        );
                    })}
                </nav>
            )}

            {/* Profile Section (Bottom) */}
            <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800 mb-2">
                {user ? (
                    <div className="flex items-center gap-3 p-3 mx-2 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 group hover:bg-white dark:hover:bg-gray-900 hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden" onClick={() => navigate('/settings')}>
                        {user.photo ? (
                            <img
                                src={getImageUrl(user.photo)}
                                alt={user.full_name}
                                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover ring-2 ring-white group-hover:ring-primary-100 transition-all flex-shrink-0"
                            />
                        ) : (
                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary-100 flex items-center justify-center ring-2 ring-white group-hover:ring-primary-100 transition-all flex-shrink-0">
                                <span className="text-primary-600 font-bold text-sm">
                                    {user.full_name?.charAt(0).toUpperCase()}
                                </span>
                            </div>
                        )}
                        <div className="flex-1 min-w-0 pr-1 truncate">
                            <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-gray-100 truncate group-hover:text-primary-700 dark:group-hover:text-primary-400 transition-colors">
                                {user.full_name}
                            </p>
                            <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 capitalize font-medium">{user.role}</p>
                        </div>
                        <Settings className="w-3.5 h-3.5 text-gray-400 group-hover:text-primary-500 transition-all flex-shrink-0" />
                    </div>
                ) : (
                    <div className="space-y-3 px-3 pb-4">
                        <button
                            onClick={() => navigate('/login')}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all font-semibold shadow-sm shadow-primary-200"
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
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 transition-colors duration-300 text-gray-900 dark:text-gray-100">
            <Navbar showSidebarToggle={true} />
            <div className="flex flex-1 relative">
                {/* Mobile Sidebar Overlay */}
                {isSidebarOpen && (
                    <div className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={toggleSidebar}>
                        <aside className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-900 shadow-xl z-50 transform transition-transform duration-300 ease-in-out" onClick={e => e.stopPropagation()}>
                            <div className="flex justify-end p-2 lg:hidden">
                                <button onClick={toggleSidebar} className="p-2 text-gray-500 hover:text-gray-300"><X className="w-5 h-5" /></button>
                            </div>
                            <SidebarContent />
                        </aside>
                    </div>
                )}

                {/* Desktop Sidebar (Sticky) */}
                {isSidebarOpen && (
                    <aside className="hidden lg:block w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 sticky top-16 h-[calc(100vh-4rem)] overflow-hidden transition-colors duration-300">
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
