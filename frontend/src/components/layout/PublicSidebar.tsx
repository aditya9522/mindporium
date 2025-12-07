import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, GraduationCap, Settings } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import { useSidebarStore } from '../../store/sidebar.store';

export const PublicSidebar = () => {
    const location = useLocation();
    const { user } = useAuthStore();
    const { isOpen } = useSidebarStore();

    const getDashboardPath = () => {
        switch (user?.role) {
            case 'admin':
                return '/admin/dashboard';
            case 'instructor':
                return '/instructor/dashboard';
            default:
                return '/dashboard';
        }
    };

    const navigationItems = [
        { icon: Home, label: 'Dashboard', path: getDashboardPath() },
        { icon: BookOpen, label: 'Courses', path: '/courses' },
        { icon: GraduationCap, label: 'Instructors', path: '/instructors' },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    if (!isOpen) return null;

    return (
        <aside className="hidden lg:block w-64 bg-white border-r border-gray-200 transition-all duration-300">
            <div className="p-6">
                {/* User Info Card */}
                {user && (
                    <div className="mb-6">
                        <div className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg">
                            {user.photo ? (
                                <img
                                    src={user.photo}
                                    alt={user.full_name}
                                    className="w-10 h-10 rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                    <span className="text-indigo-600 font-semibold">
                                        {user.full_name?.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {user.full_name}
                                </p>
                                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <nav className="space-y-1">
                    {navigationItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path ||
                            location.pathname.startsWith(item.path + '/');
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive
                                    ? 'bg-indigo-50 text-indigo-600'
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
    );
};
