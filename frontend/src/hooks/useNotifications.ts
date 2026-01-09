import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '../store/auth.store';
import { notificationService } from '../services/notification.service';
import type { Notification } from '../types/notification';
import toast from 'react-hot-toast';

export const useNotifications = () => {
    const { user, isAuthenticated } = useAuthStore();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<any>(null);

    const fetchNotifications = useCallback(async () => {
        if (!isAuthenticated) return;
        try {
            setIsLoading(true);
            const data = await notificationService.getNotifications(0, 20);
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.is_read).length);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated]);

    const connectWebSocket = useCallback(() => {
        if (!isAuthenticated || !user || wsRef.current?.readyState === WebSocket.OPEN) return;

        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        const protocol = apiUrl.startsWith('https') ? 'wss' : 'ws';
        const host = apiUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
        const wsUrl = `${protocol}://${host}/ws/notifications`;

        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
            console.log('Notification WS Connected');
            // Authenticate
            ws.send(JSON.stringify({
                type: 'auth',
                user_id: user.id
            }));
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'notification' || data.type === 'targeted') {
                    const newNotification = data.data;
                    setNotifications(prev => [newNotification, ...prev].slice(0, 50));
                    setUnreadCount(prev => prev + 1);

                    // Show toast for new notification
                    toast.success(newNotification.title, {
                        icon: '🔔',
                        position: 'bottom-right'
                    });
                }
            } catch (err) {
                console.error('Failed to parse notification message:', err);
            }
        };

        ws.onclose = () => {
            console.log('Notification WS Disconnected');
            // Try to reconnect after 5 seconds
            reconnectTimeoutRef.current = setTimeout(connectWebSocket, 5000);
        };

        ws.onerror = (err) => {
            console.error('Notification WS Error:', err);
            ws.close();
        };
    }, [isAuthenticated, user]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchNotifications();
            connectWebSocket();
        } else {
            setNotifications([]);
            setUnreadCount(0);
            if (wsRef.current) {
                wsRef.current.close();
            }
        }

        return () => {
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, [isAuthenticated, fetchNotifications, connectWebSocket]);

    const markAsRead = async (id: number) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            toast.error('Failed to mark as read');
        }
    };

    const markAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
            toast.success('All marked as read');
        } catch (err) {
            toast.error('Failed to mark all as read');
        }
    };

    return {
        notifications,
        unreadCount,
        isLoading,
        markAsRead,
        markAllAsRead,
        refresh: fetchNotifications
    };
};
