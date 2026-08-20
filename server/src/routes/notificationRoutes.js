const express = require("express");

const {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
} = require("../controllers/notificationController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.get(
    "/notifications",
    getNotifications
);

router.get(
    "/notifications/unread-count",
    getUnreadCount
);

router.patch(
    "/notifications/:notificationId/read",
    markAsRead
);

router.patch("/notifications/read-all", markAllAsRead);

module.exports = router;