const {
    getUserNotifications,
    markNotificationAsRead,
    getUnreadNotificationCount,
    markAllNotificationsAsRead,
} = require("../services/notificationService");

const getNotifications = async (
    req,
    res,
    next
) => {
    try {
        const page = Math.max(
            1,
            Number(req.query.page) || 1
        );

        const limit = Math.min(
            50,
            Math.max(
                1,
                Number(req.query.limit) || 20
            )
        );

        const notifications =
            await getUserNotifications(
                req.userId,
                page,
                limit
            );

        res.status(200).json({
            success: true,
            notifications: notifications.notifications,
            pagination: notifications.pagination,
        });
    } catch (error) {
        next(error);
    }
};

const markAsRead = async (
    req,
    res,
    next
) => {
    try {
        const notification =
            await markNotificationAsRead(
                req.userId,
                req.params.notificationId
            );

        res.status(200).json({
            success: true,
            notification,
        });
    } catch (error) {
        next(error);
    }
};

const getUnreadCount = async (
    req,
    res,
    next
) => {
    try {
        const count =
            await getUnreadNotificationCount(
                req.userId
            );

        res.status(200).json({
            success: true,
            count,
        });
    } catch (error) {
        next(error);
    }
};

const markAllAsRead = async (
    req,
    res,
    next
) => {
    try {
        const result =
            await markAllNotificationsAsRead(
                req.userId
            );

        res.status(200).json({
            success: true,
            ...result,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getNotifications,
    markAsRead,
    getUnreadCount,
    markAllAsRead
};