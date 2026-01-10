import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { BookOpen, MessageSquare, Menu, ChevronDown, LayoutDashboard, LogOut, Settings, Video } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import { useSidebarStore } from '../../store/sidebar.store';
import { NotificationDropdown } from '../notifications/NotificationDropdown';
import { FeedbackModal } from '../feedback/FeedbackModal';
import { useThemeStore } from '../../store/theme.store';
import { getImageUrl } from '../../lib/utils';

interface NavbarProps {
    showSidebarToggle?: boolean;
}

export const Navbar = ({ showSidebarToggle = false }: NavbarProps) => {
    const navigate = useNavigate();
    const { isAuthenticated, user, logout: logoutUser } = useAuthStore();
    const { toggleSidebar } = useSidebarStore();
    const [showFeedback, setShowFeedback] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const { appName, appIcon } = useThemeStore();
    const menuRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowUserMenu(false);
            }
        };

        if (showUserMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showUserMenu]);

    const logout = () => {
        logoutUser();
        navigate('/');
    };

    return (
        <>
            <nav className="border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl sticky top-0 z-50 shadow-sm transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center gap-4">
                            {(isAuthenticated || showSidebarToggle) && (
                                <button
                                    onClick={toggleSidebar}
                                    className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                    title="Toggle Sidebar"
                                >
                                    <Menu className="w-5 h-5" />
                                </button>
                            )}
                            <Link to="/" className="flex items-center gap-3 group">
                                <div className="flex items-center justify-center">
                                    {appIcon ? (
                                        <img
                                            src={appIcon.startsWith('/') ? appIcon : getImageUrl(appIcon)}
                                            alt={appName}
                                            className="h-12 w-12 object-contain group-hover:scale-110 transition-transform duration-300"
                                        />
                                    ) : (
                                        <BookOpen className="h-10 w-10 text-primary-600 dark:text-primary-400 group-hover:scale-110 transition-transform duration-300" />
                                    )}
                                </div>
                                <span className="text-2xl font-black text-gray-900 dark:text-white hidden sm:block tracking-tighter transition-colors group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                                    {appName}
                                </span>
                            </Link>
                            <div className="hidden md:flex ml-10 space-x-1">
                                <Link to="/courses" className="px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-all font-medium text-sm">Courses</Link>
                                <Link to="/instructors" className="px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-all font-medium text-sm">Instructors</Link>
                                <Link to="/community" className="px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-all font-medium text-sm">Community</Link>
                                <Link to="/news" className="px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-all font-medium text-sm">News</Link>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            {isAuthenticated && user ? (
                                <>
                                    <button
                                        onClick={() => setShowFeedback(true)}
                                        className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                                        title="Send Feedback"
                                    >
                                        <MessageSquare className="w-5 h-5" />
                                    </button>

                                    <NotificationDropdown />

                                    <div className="relative" ref={menuRef}>
                                        <button
                                            onClick={() => setShowUserMenu(!showUserMenu)}
                                            className="flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-full p-1 pl-1.5 transition-all duration-200 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900"
                                        >
                                            <div className="w-8 h-8 bg-primary-50 dark:bg-primary-900/50 rounded-full flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold border border-primary-100 dark:border-primary-800 shadow-sm">
                                                {user.full_name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="hidden md:block text-left pr-2">
                                                <p className="text-sm font-bold text-gray-700 dark:text-gray-200 max-w-[120px] truncate leading-tight">{user.full_name}</p>
                                                <p className="text-[10px] text-gray-500 dark:text-gray-400 capitalize font-medium leading-none mt-0.5">{user.role}</p>
                                            </div>
                                            <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 mr-1 ${showUserMenu ? 'rotate-180' : ''}`} />
                                        </button>

                                        {showUserMenu && (
                                            <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 py-2 animate-in fade-in slide-in-from-top-2 ring-1 ring-black/5">
                                                <div className="px-4 py-2 border-b border-gray-50 dark:border-gray-800 mb-1 lg:hidden">
                                                    <p className="font-bold text-gray-900 dark:text-gray-100">{user.full_name}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user.role}</p>
                                                </div>
                                                <Link
                                                    to={user.role === 'admin' ? '/admin/dashboard' : user.role === 'instructor' ? '/instructor/dashboard' : '/dashboard'}
                                                    className="flex items-center px-4 py-2.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors mx-1 rounded-lg"
                                                    onClick={() => setShowUserMenu(false)}
                                                >
                                                    <LayoutDashboard className="w-4 h-4 mr-3 text-gray-400" />
                                                    Dashboard
                                                </Link>
                                                <Link
                                                    to="/settings"
                                                    className="flex items-center px-4 py-2.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors mx-1 rounded-lg"
                                                    onClick={() => setShowUserMenu(false)}
                                                >
                                                    <Settings className="w-4 h-4 mr-3 text-gray-400 group-hover:text-gray-300" />
                                                    Settings
                                                </Link>
                                                {user.role === 'student' && (
                                                    <Link
                                                        to="/my-learning"
                                                        className="flex items-center px-4 py-2.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors mx-1 rounded-lg"
                                                        onClick={() => setShowUserMenu(false)}
                                                    >
                                                        <BookOpen className="w-4 h-4 mr-3 text-gray-400 group-hover:text-gray-300" />
                                                        My Learning
                                                    </Link>
                                                )}
                                                {user.role === 'instructor' && (
                                                    <Link
                                                        to="/instructor/courses"
                                                        className="flex items-center px-4 py-2.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors mx-1 rounded-lg"
                                                        onClick={() => setShowUserMenu(false)}
                                                    >
                                                        <BookOpen className="w-4 h-4 mr-3 text-gray-400 group-hover:text-gray-300" />
                                                        My Courses
                                                    </Link>
                                                )}
                                                <Link
                                                    to="/classrooms"
                                                    className="flex items-center px-4 py-2.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors mx-1 rounded-lg"
                                                    onClick={() => setShowUserMenu(false)}
                                                >
                                                    <Video className="w-4 h-4 mr-3 text-gray-400 group-hover:text-gray-300" />
                                                    Classrooms
                                                </Link>
                                                <div className="h-px bg-gray-100 dark:bg-gray-800 my-1 mx-4"></div>
                                                <button
                                                    onClick={() => {
                                                        setShowUserMenu(false);
                                                        logout();
                                                    }}
                                                    className="w-full flex items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors mx-1 rounded-lg max-w-[calc(100%-8px)]"
                                                >
                                                    <LogOut className="w-4 h-4 mr-3" />
                                                    Sign Out
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" className="hidden sm:block">
                                        <Button variant="ghost">Sign In</Button>
                                    </Link>
                                    <Link to="/register">
                                        <Button>Get Started</Button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            <FeedbackModal
                isOpen={showFeedback}
                onClose={() => setShowFeedback(false)}
                type="app"
            />
        </>
    );
};
