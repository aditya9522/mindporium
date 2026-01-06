import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { BookOpen, MessageSquare, Menu, ChevronDown, LayoutDashboard, LogOut, Settings, Video } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import { useSidebarStore } from '../../store/sidebar.store';
import { NotificationDropdown } from '../notifications/NotificationDropdown';
import { FeedbackModal } from '../feedback/FeedbackModal';

interface NavbarProps {
    showSidebarToggle?: boolean;
}

export const Navbar = ({ showSidebarToggle = false }: NavbarProps) => {
    const navigate = useNavigate();
    const { isAuthenticated, user, logout: logoutUser } = useAuthStore();
    const { toggleSidebar } = useSidebarStore();
    const [showFeedback, setShowFeedback] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
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
            <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-xl sticky top-0 z-50 shadow-sm transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center gap-4">
                            {(isAuthenticated || showSidebarToggle) && (
                                <button
                                    onClick={toggleSidebar}
                                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                    title="Toggle Sidebar"
                                >
                                    <Menu className="w-5 h-5" />
                                </button>
                            )}
                            <Link to="/" className="flex items-center gap-2">
                                <div className="bg-indigo-600 p-1.5 rounded-lg">
                                    <BookOpen className="h-6 w-6 text-white" />
                                </div>
                                <span className="text-xl font-bold text-gray-900 hidden sm:block">Mindporium</span>
                            </Link>
                            <div className="hidden md:flex ml-10 space-x-1">
                                <Link to="/courses" className="px-3 py-2 text-gray-600 hover:text-gray-900 bg-transparent hover:bg-gray-50 rounded-lg transition-all font-medium text-sm">Courses</Link>
                                <Link to="/instructors" className="px-3 py-2 text-gray-600 hover:text-gray-900 bg-transparent hover:bg-gray-50 rounded-lg transition-all font-medium text-sm">Instructors</Link>
                                <Link to="/community" className="px-3 py-2 text-gray-600 hover:text-gray-900 bg-transparent hover:bg-gray-50 rounded-lg transition-all font-medium text-sm">Community</Link>
                                <Link to="/news" className="px-3 py-2 text-gray-600 hover:text-gray-900 bg-transparent hover:bg-gray-50 rounded-lg transition-all font-medium text-sm">News</Link>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">

                            {isAuthenticated && user ? (
                                <>
                                    <button
                                        onClick={() => setShowFeedback(true)}
                                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                                        title="Send Feedback"
                                    >
                                        <MessageSquare className="w-5 h-5" />
                                    </button>

                                    <NotificationDropdown />

                                    <div className="relative" ref={menuRef}>
                                        <button
                                            onClick={() => setShowUserMenu(!showUserMenu)}
                                            className="flex items-center gap-2 hover:bg-gray-50 rounded-full p-1 pl-1.5 transition-all duration-200 border border-transparent hover:border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                                        >
                                            <div className="w-8 h-8 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 font-bold border border-indigo-100 shadow-sm">
                                                {user.full_name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="hidden md:block text-left pr-2">
                                                <p className="text-sm font-bold text-gray-700 max-w-[120px] truncate leading-tight">{user.full_name}</p>
                                                <p className="text-[10px] text-gray-500 capitalize font-medium leading-none mt-0.5">{user.role}</p>
                                            </div>
                                            <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 mr-1 ${showUserMenu ? 'rotate-180' : ''}`} />
                                        </button>

                                        {showUserMenu && (
                                            <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 animate-in fade-in slide-in-from-top-2 ring-1 ring-black/5">
                                                <div className="px-4 py-2 border-b border-gray-50 mb-1 lg:hidden">
                                                    <p className="font-bold text-gray-900">{user.full_name}</p>
                                                    <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                                                </div>
                                                <Link
                                                    to={user.role === 'admin' ? '/admin/dashboard' : user.role === 'instructor' ? '/instructor/dashboard' : '/dashboard'}
                                                    className="flex items-center px-4 py-2.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors mx-1 rounded-lg"
                                                    onClick={() => setShowUserMenu(false)}
                                                >
                                                    <LayoutDashboard className="w-4 h-4 mr-3 text-gray-400" />
                                                    Dashboard
                                                </Link>
                                                <Link
                                                    to="/settings"
                                                    className="flex items-center px-4 py-2.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors mx-1 rounded-lg"
                                                    onClick={() => setShowUserMenu(false)}
                                                >
                                                    <Settings className="w-4 h-4 mr-3 text-gray-400" />
                                                    Settings
                                                </Link>
                                                {user.role === 'student' && (
                                                    <Link
                                                        to="/my-learning"
                                                        className="flex items-center px-4 py-2.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors mx-1 rounded-lg"
                                                        onClick={() => setShowUserMenu(false)}
                                                    >
                                                        <BookOpen className="w-4 h-4 mr-3 text-gray-400" />
                                                        My Learning
                                                    </Link>
                                                )}
                                                {user.role === 'instructor' && (
                                                    <Link
                                                        to="/instructor/courses"
                                                        className="flex items-center px-4 py-2.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors mx-1 rounded-lg"
                                                        onClick={() => setShowUserMenu(false)}
                                                    >
                                                        <BookOpen className="w-4 h-4 mr-3 text-gray-400" />
                                                        My Courses
                                                    </Link>
                                                )}
                                                <Link
                                                    to="/classrooms"
                                                    className="flex items-center px-4 py-2.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors mx-1 rounded-lg"
                                                    onClick={() => setShowUserMenu(false)}
                                                >
                                                    <Video className="w-4 h-4 mr-3 text-gray-400" />
                                                    Classrooms
                                                </Link>
                                                <div className="h-px bg-gray-100 my-1 mx-4"></div>
                                                <button
                                                    onClick={() => {
                                                        setShowUserMenu(false);
                                                        logout();
                                                    }}
                                                    className="w-full flex items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors mx-1 rounded-lg max-w-[calc(100%-8px)]"
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
