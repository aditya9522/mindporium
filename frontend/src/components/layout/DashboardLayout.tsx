import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';

import { useSidebarStore } from '../../store/sidebar.store';
import { PageLoader } from '../common/PageLoader';
import { Navbar } from '../layout/Navbar';
import { Home, BookOpen, Users, Settings, BarChart3, Shield, GraduationCap, Bot, FileText, Video, MessageSquare, Megaphone, User, Bell, Calendar, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { getImageUrl } from '../../lib/utils';
import { useThemeStore } from '../../store/theme.store';
import { useTranslation } from '../../hooks/useTranslation';

export const DashboardLayout = () => {
    const { isAuthenticated, checkAuth, isLoading, user } = useAuthStore();
    const { isOpen: isSidebarOpen, toggleSidebar, customSidebarContent } = useSidebarStore();
    const { } = useThemeStore();
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();

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
                { icon: Home, label: t('nav.dashboard'), path: '/' },
                { icon: BookOpen, label: t('nav.courses'), path: '/courses' },
                { icon: GraduationCap, label: t('nav.instructors'), path: '/instructors' },
            ];
        }

        if (user?.role === 'admin') {
            return [
                { icon: Home, label: t('nav.dashboard'), path: '/admin/dashboard' },
                { icon: Users, label: t('nav.users'), path: '/admin/users' },
                { icon: GraduationCap, label: t('nav.instructors'), path: '/admin/instructors' },
                { icon: BookOpen, label: t('nav.courses'), path: '/admin/courses' },
                { icon: Megaphone, label: t('nav.announcements'), path: '/admin/announcements' },
                { icon: Shield, label: t('nav.system'), path: '/admin/system' },
                { icon: MessageSquare, label: t('nav.feedback'), path: '/admin/feedback' },
                { icon: Users, label: t('nav.community'), path: '/community' },
                { icon: Bot, label: t('nav.ai_assistant'), path: '/chatbot' },
                { icon: Settings, label: t('nav.settings'), path: '/settings' },
            ];
        }

        if (user?.role === 'instructor') {
            return [
                { icon: Home, label: t('nav.dashboard'), path: '/instructor/dashboard' },
                { icon: BookOpen, label: t('nav.my_learning'), path: '/instructor/courses' },
                { icon: Users, label: 'Students', path: '/instructor/students' },
                { icon: FileText, label: t('nav.tests'), path: '/instructor/tests' },
                { icon: Video, label: t('nav.classrooms'), path: '/classrooms' },
                { icon: Calendar, label: t('nav.attendance'), path: '/instructor/attendance' },
                { icon: Users, label: t('nav.community'), path: '/community' },
                { icon: BarChart3, label: t('nav.analytics'), path: '/instructor/analytics' },
                { icon: MessageSquare, label: t('nav.feedback'), path: '/instructor/feedback' },
                { icon: User, label: t('nav.my_profile'), path: '/instructor/profile' },
                { icon: Bot, label: t('nav.ai_assistant'), path: '/chatbot' },
                { icon: Settings, label: t('nav.settings'), path: '/settings' },
            ];
        }
        // Student menu
        return [
            { icon: Home, label: t('nav.dashboard'), path: '/dashboard' },
            { icon: BookOpen, label: t('nav.courses'), path: '/courses' },
            { icon: BookOpen, label: t('nav.my_learning'), path: '/my-learning' },
            { icon: FileText, label: t('nav.tests'), path: '/tests' },
            { icon: Video, label: t('nav.classrooms'), path: '/classrooms' },
            { icon: Calendar, label: t('nav.attendance'), path: '/student/attendance' },
            { icon: Users, label: t('nav.community'), path: '/community' },
            { icon: GraduationCap, label: t('nav.instructors'), path: '/instructors' },
            { icon: MessageSquare, label: t('nav.feedback'), path: '/feedback' },
            { icon: Bell, label: t('nav.notifications'), path: '/notifications' },
            { icon: Bot, label: t('nav.ai_assistant'), path: '/chatbot' },
            { icon: Settings, label: t('nav.settings'), path: '/settings' },
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
                        const isActive = location.pathname === item.path;
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
                                <span className="text-sm">{item.label}</span>
                                {isActive && (
                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-600" />
                                )}
                            </Link>
                        );
                    })}
                </nav>
            )}

            {/* Profile Section (Bottom) */}
            <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800 mb-2">
                {user ? (
                    <div className="flex items-center gap-3 p-3 mx-2 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 group hover:bg-white dark:hover:bg-gray-900 hover:shadow-md transition-all duration-200 cursor-pointer" onClick={() => navigate('/settings')}>
                        {user.photo ? (
                            <img
                                src={getImageUrl(user.photo)}
                                alt={user.full_name}
                                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover ring-2 ring-white group-hover:ring-primary-100 transition-all"
                            />
                        ) : (
                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary-100 flex items-center justify-center ring-2 ring-white group-hover:ring-primary-100 transition-all">
                                <span className="text-primary-600 font-bold text-sm">
                                    {user.full_name?.charAt(0).toUpperCase()}
                                </span>
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-gray-100 truncate group-hover:text-primary-700 dark:group-hover:text-primary-400 transition-colors">
                                {user.full_name}
                            </p>
                            <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 capitalize font-medium">{user.role}</p>
                        </div>
                        <Settings className="w-3.5 h-3.5 text-gray-400 group-hover:text-primary-500 transition-all" />
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
        <div className="min-h-screen flex flex-col bg-gray-50">
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
