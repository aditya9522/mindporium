import { useState, useEffect } from 'react';
import { Bell, Check, CheckCheck, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface Notification {
    id: number;
    title: string;
    message: string;
    notification_type: string;
    is_read: boolean;
    created_at: string;
}

export const NotificationsPage = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        try {
            const response = await api.get<Notification[]>('/notifications');
            setNotifications(response.data);
        } catch (error) {
            console.error('Failed to load notifications:', error);
            toast.error('Failed to load notifications');
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id: number) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, is_read: true } : n)
            );
            toast.success('Marked as read');
        } catch (error) {
            toast.error('Failed to mark as read');
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.put('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            toast.success('All notifications marked as read');
        } catch (error) {
            toast.error('Failed to mark all as read');
        }
    };

    const getNotificationIcon = (type: string) => {
        const iconClass = "w-10 h-10 rounded-full flex items-center justify-center";
        switch (type) {
            case 'course':
                return <div className={`${iconClass} bg-blue-100`}><Bell className="w-5 h-5 text-blue-600" /></div>;
            case 'announcement':
                return <div className={`${iconClass} bg-purple-100`}><Bell className="w-5 h-5 text-purple-600" /></div>;
            case 'class':
            case 'class_reminder':
                return <div className={`${iconClass} bg-green-100`}><Bell className="w-5 h-5 text-green-600" /></div>;
            case 'test':
                return <div className={`${iconClass} bg-orange-100`}><Bell className="w-5 h-5 text-orange-600" /></div>;
            case 'grade':
                return <div className={`${iconClass} bg-yellow-100`}><Bell className="w-5 h-5 text-yellow-600" /></div>;
            case 'resource':
                return <div className={`${iconClass} bg-indigo-100`}><Bell className="w-5 h-5 text-indigo-600" /></div>;
            case 'enrollment':
                return <div className={`${iconClass} bg-teal-100`}><Bell className="w-5 h-5 text-teal-600" /></div>;
            default:
                return <div className={`${iconClass} bg-gray-100`}><Bell className="w-5 h-5 text-gray-600" /></div>;
        }
    };

    const filteredNotifications = filter === 'unread'
        ? notifications.filter(n => !n.is_read)
        : notifications;

    const unreadCount = notifications.filter(n => !n.is_read).length;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-indigo-100 rounded-xl">
                                <Bell className="w-6 h-6 text-indigo-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                                <p className="text-sm text-gray-600">
                                    {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
                                </p>
                            </div>
                        </div>
                        {unreadCount > 0 && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={markAllAsRead}
                                className="flex items-center gap-2"
                            >
                                <CheckCheck className="w-4 h-4" />
                                Mark all as read
                            </Button>
                        )}
                    </div>

                    {/* Filters */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'all'
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            All ({notifications.length})
                        </button>
                        <button
                            onClick={() => setFilter('unread')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'unread'
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Unread ({unreadCount})
                        </button>
                    </div>
                </div>

                {/* Notifications List */}
                <div className="space-y-3">
                    {filteredNotifications.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No notifications</h3>
                            <p className="text-gray-600">
                                {filter === 'unread' ? "You're all caught up!" : "You don't have any notifications yet."}
                            </p>
                        </div>
                    ) : (
                        filteredNotifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`bg-white rounded-xl shadow-sm border transition-all hover:shadow-md ${notification.is_read
                                        ? 'border-gray-200'
                                        : 'border-indigo-200 bg-indigo-50/30'
                                    }`}
                            >
                                <div className="p-4 flex gap-4">
                                    {/* Icon */}
                                    <div className="flex-shrink-0">
                                        {getNotificationIcon(notification.notification_type)}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-900 mb-1">
                                                    {notification.title}
                                                    {!notification.is_read && (
                                                        <span className="ml-2 inline-block w-2 h-2 bg-indigo-600 rounded-full"></span>
                                                    )}
                                                </h3>
                                                <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                                                <p className="text-xs text-gray-500">
                                                    {format(new Date(notification.created_at), 'MMM d, yyyy • h:mm a')}
                                                </p>
                                            </div>

                                            {/* Actions */}
                                            {!notification.is_read && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => markAsRead(notification.id)}
                                                    className="flex-shrink-0"
                                                >
                                                    <Check className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
