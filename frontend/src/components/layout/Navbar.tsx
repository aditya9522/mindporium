import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { BookOpen, MessageSquare, Menu, Search, Clock, ChevronDown, LayoutDashboard, LogOut, Settings, Video } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import { useSidebarStore } from '../../store/sidebar.store';
import { NotificationDropdown } from '../notifications/NotificationDropdown';
import { FeedbackModal } from '../feedback/FeedbackModal';

interface NavbarProps {
    showSidebarToggle?: boolean;
}

const ActiveClock = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="flex items-center text-gray-500 text-sm font-medium tabular-nums px-3 py-1 bg-gray-50 rounded-lg border border-gray-100 hidden xl:flex">
            <Clock className="w-3.5 h-3.5 mr-2 text-indigo-500" />
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </div>
    );
};

export const Navbar = ({ showSidebarToggle = false }: NavbarProps) => {
    const navigate = useNavigate();
    const { isAuthenticated, user, logout: logoutUser } = useAuthStore();
    const { toggleSidebar } = useSidebarStore();
    const [showFeedback, setShowFeedback] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
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

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/courses?search=${encodeURIComponent(searchQuery)}`);
        }
    };

    return (
        <>
            <nav className="border-b bg-white/75 backdrop-blur-lg sticky top-0 z-50">
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
                            <div className="hidden md:flex ml-8 space-x-6">
                                <Link to="/courses" className="text-gray-600 hover:text-indigo-600 transition-colors font-medium text-sm">Courses</Link>
                                <Link to="/instructors" className="text-gray-600 hover:text-indigo-600 transition-colors font-medium text-sm">Instructors</Link>
                                <Link to="/community" className="text-gray-600 hover:text-indigo-600 transition-colors font-medium text-sm">Community</Link>
                                <Link to="/news" className="text-gray-600 hover:text-indigo-600 transition-colors font-medium text-sm">News</Link>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Quick Search */}
                            <form onSubmit={handleSearch} className="hidden lg:block relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Quick search..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 pr-4 py-1.5 w-64 bg-gray-50 border border-gray-200 rounded-full text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                />
                            </form>

                            <ActiveClock />

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
                                            className="flex items-center gap-2 hover:bg-gray-50 rounded-lg p-1.5 transition-colors"
                                        >
                                            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold border border-indigo-200">
                                                {user.full_name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="hidden md:block text-left">
                                                <p className="text-sm font-medium text-gray-700 max-w-[100px] truncate">{user.full_name}</p>
                                                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                                            </div>
                                            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                                        </button>

                                        {showUserMenu && (
                                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 animate-in fade-in slide-in-from-top-2">
                                                <Link
                                                    to={user.role === 'admin' ? '/admin/dashboard' : user.role === 'instructor' ? '/instructor/dashboard' : '/dashboard'}
                                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                                    onClick={() => setShowUserMenu(false)}
                                                >
                                                    <LayoutDashboard className="w-4 h-4 mr-2 text-gray-400" />
                                                    Dashboard
                                                </Link>
                                                <Link
                                                    to="/settings"
                                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                                    onClick={() => setShowUserMenu(false)}
                                                >
                                                    <Settings className="w-4 h-4 mr-2 text-gray-400" />
                                                    Settings
                                                </Link>
                                                {user.role === 'student' && (
                                                    <Link
                                                        to="/my-learning"
                                                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                                        onClick={() => setShowUserMenu(false)}
                                                    >
                                                        <BookOpen className="w-4 h-4 mr-2 text-gray-400" />
                                                        My Learning
                                                    </Link>
                                                )}
                                                {user.role === 'instructor' && (
                                                    <Link
                                                        to="/instructor/courses"
                                                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                                        onClick={() => setShowUserMenu(false)}
                                                    >
                                                        <BookOpen className="w-4 h-4 mr-2 text-gray-400" />
                                                        My Courses
                                                    </Link>
                                                )}
                                                <Link
                                                    to="/classrooms"
                                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                                    onClick={() => setShowUserMenu(false)}
                                                >
                                                    <Video className="w-4 h-4 mr-2 text-gray-400" />
                                                    Classrooms
                                                </Link>
                                                <div className="h-px bg-gray-100 my-1"></div>
                                                <button
                                                    onClick={() => {
                                                        setShowUserMenu(false);
                                                        logout();
                                                    }}
                                                    className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                                >
                                                    <LogOut className="w-4 h-4 mr-2" />
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
