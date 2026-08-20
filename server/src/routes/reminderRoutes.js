const express = require("express");

const {
    createReminder,
    getReminder,
    updateReminder,
    deleteReminder,
} = require("../controllers/reminderController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.post(
    "/assets/:assetId/reminder",
    createReminder
);

router.get(
    "/assets/:assetId/reminder",
    getReminder
);

router.put(
    "/assets/:assetId/reminder",
    updateReminder
);

router.delete(
    "/assets/:assetId/reminder",
    deleteReminder
);

module.exports = router;