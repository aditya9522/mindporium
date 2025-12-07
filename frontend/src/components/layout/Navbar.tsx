import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { BookOpen, MessageSquare, Menu } from 'lucide-react';
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

    const logout = () => {
        logoutUser();
        navigate('/');
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
                                <span className="text-xl font-bold text-gray-900">Mindporium</span>
                            </Link>
                            <div className="hidden md:flex ml-10 space-x-8">
                                <Link to="/courses" className="text-gray-600 hover:text-indigo-600 transition-colors">Courses</Link>
                                <Link to="/instructors" className="text-gray-600 hover:text-indigo-600 transition-colors">Instructors</Link>
                                <Link to="/community" className="text-gray-600 hover:text-indigo-600 transition-colors">Community</Link>
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

                                    <div className="h-6 w-px bg-gray-200 mx-2"></div>

                                    <span className="text-sm text-gray-600 hidden md:block font-medium">
                                        {user.full_name}
                                    </span>
                                    <Button variant="ghost" onClick={logout} className="text-sm">
                                        Sign Out
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Link to="/login">
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
