const express = require("express");

const {
    createServiceHistory,
    getServiceHistories,
    getServiceHistoryByAsset,
    getServiceHistoryById,
    updateServiceHistory,
    deleteServiceHistory,
} = require("../controllers/serviceHistoryController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.post(
    "/",
    createServiceHistory
);

router.get(
    "/",
    getServiceHistories
);

router.get(
    "/asset/:assetId",
    getServiceHistoryByAsset
);

router.get(
    "/:id",
    getServiceHistoryById
);

router.put(
    "/:id",
    updateServiceHistory
);

router.delete(
    "/:id",
    deleteServiceHistory
);

module.exports = router;