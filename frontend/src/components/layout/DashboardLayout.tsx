import { useEffect } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { useSidebarStore } from '../../store/sidebar.store';
import { PageLoader } from '../common/PageLoader';
import { Navbar } from '../layout/Navbar';
import { getImageUrl } from '../../lib/utils';
import {
    Home, BookOpen, Users, Settings, BarChart3, Shield, GraduationCap,
    Bot, FileText, Video, MessageSquare, Megaphone, User, Bell, Calendar,
    X, BriefcaseBusiness, StickyNote, FolderOpen, FileDiff, Gift, Percent, Newspaper, type LucideIcon,
} from 'lucide-react';

interface MenuItem {
    icon: LucideIcon;
    label: string;
    path: string;
    new?: boolean;
    beta?: boolean;
}

interface MenuSection {
    title: string;
    items: MenuItem[];
}

export const DashboardLayout = () => {
    const { isAuthenticated, checkAuth, isLoading, user } = useAuthStore();
    const { isOpen: isSidebarOpen, toggleSidebar, customSidebarContent } = useSidebarStore();
    const navigate = useNavigate();
    const location = useLocation();

    const isPublicRoute = (path: string) => {
        const publicPaths = ['/courses', '/instructors'];
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

    // ── Role-based menu sections ──────────────────────────────────────────────
    const getMenuSections = (): MenuSection[] => {
        if (!user) {
            return [
                {
                    title: 'Explore',
                    items: [
                        { icon: Home,          label: 'Dashboard',   path: '/' },
                        { icon: BookOpen,      label: 'Courses',     path: '/courses' },
                        { icon: GraduationCap, label: 'Instructors', path: '/instructors' },
                    ]
                }
            ];
        }

        if (user.role === 'admin') {
            return [
                {
                    title: 'Workspace',
                    items: [
                        { icon: Home,          label: 'Dashboard',     path: '/admin/dashboard' },
                        { icon: Users,         label: 'Users',         path: '/admin/users' },
                        { icon: GraduationCap, label: 'Instructors',   path: '/admin/instructors' },
                        { icon: BookOpen,      label: 'Courses',       path: '/admin/courses' },
                    ]
                },
                {
                    title: 'Content & Media',
                    items: [
                        { icon: Megaphone,     label: 'Announcements', path: '/admin/announcements' },
                        { icon: Percent,       label: 'Coupons',       path: '/admin/coupons' },
                        { icon: StickyNote,    label: 'Notes',         path: '/notes' },
                        { icon: FolderOpen,    label: 'Media Library', path: '/media-library' },
                        { icon: FileDiff,      label: 'Text Compare',  path: '/text-compare' },
                        { icon: Newspaper,     label: 'News',          path: '/news' },
                    ]
                },
                {
                    title: 'System & Support',
                    items: [
                        { icon: Shield,        label: 'System',        path: '/admin/system' },
                        { icon: MessageSquare, label: 'Feedback',      path: '/admin/feedback' },
                        { icon: Users,         label: 'Community',     path: '/community' },
                        { icon: Bot,           label: 'AI Assistant',  path: '/chatbot' },
                        { icon: Settings,      label: 'Settings',      path: '/settings' },
                    ]
                }
            ];
        }

        if (user.role === 'instructor') {
            return [
                {
                    title: 'Workspace',
                    items: [
                        { icon: Home,          label: 'Dashboard',    path: '/instructor/dashboard' },
                        { icon: BookOpen,      label: 'My Courses',   path: '/instructor/courses' },
                        { icon: Users,         label: 'Students',     path: '/instructor/students' },
                    ]
                },
                {
                    title: 'Academic',
                    items: [
                        { icon: FileText,      label: 'Tests',        path: '/instructor/tests' },
                        { icon: Video,         label: 'Classrooms',   path: '/classrooms' },
                        { icon: Calendar,      label: 'Attendance',   path: '/instructor/attendance' },
                    ]
                },
                {
                    title: 'Content & Growth',
                    items: [
                        { icon: StickyNote,    label: 'My Notes',     path: '/notes' },
                        { icon: FolderOpen,    label: 'Media Library', path: '/media-library' },
                        { icon: FileDiff,      label: 'Text Compare',  path: '/text-compare' },
                        { icon: BarChart3,     label: 'Analytics',    path: '/instructor/analytics' },
                        { icon: Newspaper,     label: 'News',         path: '/news' },
                    ]
                },
                {
                    title: 'Connect',
                    items: [
                        { icon: Users,         label: 'Community',    path: '/community' },
                        { icon: MessageSquare, label: 'Feedback',     path: '/instructor/feedback' },
                        { icon: User,          label: 'My Profile',   path: '/instructor/profile' },
                        { icon: Bot,           label: 'AI Assistant', path: '/chatbot' },
                        { icon: Settings,      label: 'Settings',     path: '/settings' },
                    ]
                }
            ];
        }

        // Student menu sections
        return [
            {
                title: 'Workspace',
                items: [
                    { icon: Home,              label: 'Dashboard',        path: '/dashboard' },
                    { icon: BookOpen,          label: 'Courses',          path: '/courses' },
                    { icon: BookOpen,          label: 'My Learning',      path: '/my-learning' },
                    { icon: StickyNote,        label: 'My Notes',         path: '/notes',               new: true },
                    { icon: FolderOpen,        label: 'Media Library',    path: '/media-library' },
                ]
            },
            {
                title: 'Academic & Live',
                items: [
                    { icon: Video,             label: 'Classrooms',       path: '/classrooms' },
                    { icon: FileText,          label: 'Tests',            path: '/tests' },
                    { icon: Calendar,          label: 'Attendance',       path: '/student/attendance' },
                ]
            },
            {
                title: 'Growth & AI Tools',
                items: [
                    { icon: BriefcaseBusiness, label: 'Career Workspace', path: '/career/job-search' },
                    { icon: Bot,               label: 'AI Assistant',     path: '/chatbot' },
                    { icon: FileDiff,          label: 'Text Compare',     path: '/text-compare' },
                    { icon: Newspaper,         label: 'News',             path: '/news' },
                ]
            },
            {
                title: 'Connect & Support',
                items: [
                    { icon: Users,             label: 'Community',        path: '/community' },
                    { icon: GraduationCap,     label: 'Instructors',      path: '/instructors' },
                    { icon: Bell,              label: 'Notifications',    path: '/notifications' },
                    { icon: Gift,              label: 'Referrals',        path: '/referrals' },
                    { icon: MessageSquare,     label: 'Feedback',         path: '/feedback' },
                    { icon: Settings,          label: 'Settings',         path: '/settings' },
                ]
            }
        ];
    };

    const menuSections = getMenuSections();

    // ── Sidebar Component ─────────────────────────────────────────────────────
    const renderSidebarContent = () => (
        <div className="h-full min-h-0 flex flex-col pt-4 bg-white dark:bg-gray-900 transition-colors duration-300">
            {customSidebarContent ? (
                <div className="animate-in fade-in slide-in-from-left-4 duration-300 flex-1 min-h-0 overflow-y-auto">
                    {customSidebarContent}
                </div>
            ) : (
                <nav className="px-2.5 lg:px-3 flex-1 min-h-0 overflow-y-auto pb-3 lg:pb-4 space-y-4">
                    {menuSections.map((section) => (
                        <div key={section.title} className="space-y-1">
                            <h3 className="px-3 text-[10px] font-bold tracking-wider text-gray-400 dark:text-gray-500 uppercase select-none">
                                {section.title}
                            </h3>
                            <div className="space-y-0.5 lg:space-y-1">
                                {section.items.map((item) => {
                                    const Icon = item.icon;
                                    const isActive =
                                        location.pathname === item.path ||
                                        (item.path !== '/' && item.path !== '/courses' && location.pathname.startsWith(item.path));

                                    return (
                                        <Link
                                            key={item.path + item.label}
                                            to={item.path}
                                            onClick={() => window.innerWidth < 1024 && toggleSidebar()}
                                            className={`group flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 ${
                                                isActive
                                                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 shadow-sm font-semibold'
                                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 font-medium'
                                            }`}
                                        >
                                            <Icon
                                                className={`h-4.5 w-4.5 shrink-0 transition-colors ${
                                                    isActive
                                                        ? 'text-primary-600 dark:text-primary-400'
                                                        : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                                                }`}
                                            />
                                            <span className="min-w-0 flex-1 truncate text-sm">{item.label}</span>
                                            {item.new && (
                                                <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/50 px-1.5 py-0.5 text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-300 shrink-0">
                                                    New
                                                </span>
                                            )}
                                            {item.beta && (
                                                <span className="rounded-full bg-amber-100 dark:bg-amber-950/50 px-1.5 py-0.5 text-[10px] font-bold uppercase text-amber-700 dark:text-amber-300 shrink-0">
                                                    Beta
                                                </span>
                                            )}
                                            {isActive && (
                                                <div className="h-1.5 w-1.5 rounded-full bg-primary-600 shrink-0" />
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>
            )}

            {/* Profile Card (Bottom) */}
            <div className="mt-auto shrink-0 pt-2.5 lg:pt-3 border-t border-gray-100 dark:border-gray-800 px-2 pb-2.5 lg:pb-3 bg-white dark:bg-gray-900">
                {user ? (
                    <div
                        className="flex items-center gap-2.5 lg:gap-3 p-2.5 lg:p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 group hover:bg-white dark:hover:bg-gray-900 hover:border-primary-200 dark:hover:border-primary-800 hover:shadow-md transition-all duration-200 cursor-pointer"
                        onClick={() => navigate('/settings')}
                    >
                        {user.photo ? (
                            <img
                                src={getImageUrl(user.photo)}
                                alt={user.full_name}
                                className="w-8 h-8 lg:w-9 lg:h-9 rounded-full object-cover ring-2 ring-white dark:ring-gray-800 group-hover:ring-primary-200 dark:group-hover:ring-primary-500 transition-all shrink-0"
                            />
                        ) : (
                            <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center ring-2 ring-white dark:ring-gray-800 group-hover:ring-primary-200 dark:group-hover:ring-primary-500 transition-all shrink-0">
                                <span className="text-primary-600 dark:text-primary-400 font-bold text-sm">
                                    {user.full_name?.charAt(0).toUpperCase()}
                                </span>
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate group-hover:text-primary-700 dark:group-hover:text-primary-400 transition-colors leading-tight">
                                {user.full_name}
                            </p>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 capitalize font-medium leading-tight">{user.role}</p>
                        </div>
                        <Settings className="w-3.5 h-3.5 text-gray-400 group-hover:text-primary-500 transition-all shrink-0" />
                    </div>
                ) : (
                    <div className="space-y-2">
                        <button
                            onClick={() => navigate('/login')}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all font-semibold text-sm shadow-sm"
                        >
                            Log In
                        </button>
                        <button
                            onClick={() => navigate('/register')}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all font-semibold text-sm"
                        >
                            Sign Up
                        </button>
                    </div>
                )}
            </div>
        </div>
    );

    // ── Layout ────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 transition-colors duration-300 text-gray-900 dark:text-gray-100">
            <Navbar showSidebarToggle={true} />
            <div className="flex flex-1 relative">
                {/* Mobile Sidebar Overlay */}
                {isSidebarOpen && (
                    <div
                        className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                        onClick={toggleSidebar}
                    >
                        <aside
                            className="fixed inset-y-0 left-0 flex w-[min(18rem,calc(100vw-1rem))] flex-col bg-white dark:bg-gray-900 shadow-2xl z-50 border-r border-gray-200 dark:border-gray-800"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex justify-end p-2 shrink-0">
                                <button
                                    onClick={toggleSidebar}
                                    className="p-2 rounded-lg text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="min-h-0 flex-1">
                                {renderSidebarContent()}
                            </div>
                        </aside>
                    </div>
                )}

                {/* Desktop Sidebar (Sticky) */}
                {isSidebarOpen && (
                    <aside className="hidden lg:block w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 sticky top-16 h-[calc(100vh-4rem)] overflow-hidden transition-colors duration-300 shrink-0">
                        {renderSidebarContent()}
                    </aside>
                )}

                <main className="flex-1 min-w-0">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};
