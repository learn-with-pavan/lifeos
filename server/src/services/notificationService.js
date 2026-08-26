const Notification = require("../models/Notification");
const Reminder = require("../models/Reminder");

const createWarrantyNotification = async (
    reminderId
) => {
    const reminder = await Reminder.findById(
        reminderId
    )
        .populate("asset")
        .populate("warranty");

    if (!reminder) {
        const error = new Error(
            "Reminder not found"
        );

        error.statusCode = 404;

        throw error;
    }

    const existingNotification =
        await Notification.findOne({
            reminder: reminder._id,
        });

    if (existingNotification) {
        return existingNotification;
    }

    const assetName =
        reminder.asset?.name || "Your asset";

    const warrantyEndDate =
        reminder.warranty?.endDate;

    if (!warrantyEndDate) {
        const error = new Error(
            "Warranty expiry date not found"
        );

        error.statusCode = 400;

        throw error;
    }

    const expiryDate = new Date(
        warrantyEndDate
    );

    const today = new Date();

    const difference =
        expiryDate.getTime() -
        today.getTime();

    const daysRemaining = Math.max(
        0,
        Math.ceil(
            difference /
            (1000 * 60 * 60 * 24)
        )
    );

    const title =
        "Warranty expiry reminder";

    const message =
        daysRemaining === 0
            ? `${assetName} warranty expires today.`
            : `${assetName} warranty expires in ${daysRemaining} days.`;

    try {
        return await Notification.create({
            user: reminder.user,
            asset: reminder.asset._id,
            reminder: reminder._id,
            type: "WARRANTY_EXPIRY",
            title,
            message,
        });
    } catch (error) {
        if (error.code !== 11000) {
            throw error;
        }

        return Notification.findOne({
            reminder: reminder._id,
        });
    }
};

const getUserNotifications = async (
    userId,
    page = 1,
    limit = 20
) => {
    const skip =
        (page - 1) * limit;

    const [
        notifications,
        total,
    ] = await Promise.all([
        Notification.find({
            user: userId,
        })
            .populate("asset", "name")
            .populate(
                "serviceRequest",
                "status asset serviceProvider"
            )
            .populate(
                "payment",
                "amount currency status"
            )
            .sort({
                createdAt: -1,
            })
            .skip(skip)
            .limit(limit),

        Notification.countDocuments({
            user: userId,
        }),
    ]);

    return {
        notifications,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(
                total / limit
            ),
        },
    };
};

const markNotificationAsRead = async (
    userId,
    notificationId
) => {
    const notification =
        await Notification.findOne({
            _id: notificationId,
            user: userId,
        });

    if (!notification) {
        const error = new Error(
            "Notification not found"
        );

        error.statusCode = 404;

        throw error;
    }

    if (!notification.isRead) {
        notification.isRead = true;
        notification.readAt = new Date();

        await notification.save();
    }

    return notification;
};

const getUnreadNotificationCount =
    async (userId) => {
        return Notification.countDocuments({
            user: userId,
            isRead: false,
        });
    };

const markAllNotificationsAsRead = async (userId) => {
    const result =
        await Notification.updateMany(
            {
                user: userId,
                isRead: false,
            },
            {
                $set: {
                    isRead: true,
                    readAt: new Date(),
                },
            }
        );

    return {
        modifiedCount:
            result.modifiedCount,
    };
};

const createAutomationNotification = async ({
    userId,
    assetId = null,
    serviceRequestId = null,
    paymentId = null,
    title,
    message,
    eventType,
    notificationType = null,
    automationKey,
}) => {

    const resolvedNotificationType =
        notificationType ||
        (
            eventType === "WARRANTY_EXPIRING"
                ? "WARRANTY_EXPIRY"
                : eventType
        );

    try {

        return await Notification.create({
            user: userId,

            asset: assetId,

            serviceRequest: serviceRequestId,

            payment: paymentId,

            automationKey,

            type:
                resolvedNotificationType,

            title,

            message,

            isRead: false,

            readAt: null,
        });

    } catch (error) {

        if (
            error.code !== 11000 ||
            !automationKey
        ) {
            throw error;
        }

        return Notification.findOne({
            automationKey,
        });
    }
};

module.exports = {
    createWarrantyNotification,
    getUserNotifications,
    markNotificationAsRead,
    getUnreadNotificationCount,
    markAllNotificationsAsRead,
    createAutomationNotification
};