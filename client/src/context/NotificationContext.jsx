import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import {
    getNotifications,
    getUnreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
} from "../services/notificationService";

const NotificationContext =
    createContext(null);

export const NotificationProvider = ({
    children,
}) => {
    const [notifications, setNotifications] =
        useState([]);

    const [unreadCount, setUnreadCount] =
        useState(0);

    const [loading, setLoading] =
        useState(false);

    const loadNotifications =
        async () => {
            try {
                setLoading(true);

                const [
                    notificationData,
                    unreadData,
                ] = await Promise.all([
                    getNotifications(1, 20),
                    getUnreadNotificationCount(),
                ]);

                setNotifications(
                    notificationData.notifications || []
                );

                setUnreadCount(
                    unreadData.count || 0
                );
            } catch (error) {
                console.error(
                    "Failed to load notifications:",
                    error
                );
            } finally {
                setLoading(false);
            }
        };

    const refreshUnreadCount =
        async () => {
            try {
                const data =
                    await getUnreadNotificationCount();

                setUnreadCount(
                    data.count || 0
                );
            } catch (error) {
                console.error(
                    "Failed to refresh unread count:",
                    error
                );
            }
        };

    const markAsRead =
        async (notificationId) => {
            try {
                await markNotificationAsRead(
                    notificationId
                );

                setNotifications((current) =>
                    current.map((notification) =>
                        notification._id ===
                            notificationId
                            ? {
                                ...notification,
                                isRead: true,
                                readAt: new Date(),
                            }
                            : notification
                    )
                );

                setUnreadCount((current) =>
                    Math.max(0, current - 1)
                );
            } catch (error) {
                console.error(
                    "Failed to mark notification as read:",
                    error
                );
            }
        };

    const markAllAsRead =
        async () => {
            try {
                await markAllNotificationsAsRead();

                setNotifications((current) =>
                    current.map((notification) => ({
                        ...notification,
                        isRead: true,
                        readAt:
                            notification.readAt ||
                            new Date(),
                    }))
                );

                setUnreadCount(0);
            } catch (error) {
                console.error(
                    "Failed to mark all notifications as read:",
                    error
                );
            }
        };

    useEffect(() => {
        loadNotifications();

        const interval = setInterval(() => {
            loadNotifications();
        }, 30000);

        return () => {
            clearInterval(interval);
        };
    }, []);

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unreadCount,
                loading,
                loadNotifications,
                refreshUnreadCount,
                markAsRead,
                markAllAsRead,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context =
        useContext(NotificationContext);

    if (!context) {
        throw new Error(
            "useNotifications must be used inside NotificationProvider"
        );
    }

    return context;
};