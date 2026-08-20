const express = require("express");

const {
    create,
    getByAsset,
    getAll,
    getById,
    update,
    remove,
} = require("../controllers/maintenanceController");

const authMiddleware = require(
    "../middleware/authMiddleware"
);

const router = express.Router();

router.use(authMiddleware);

/*
    Asset-specific maintenance
*/

router.post(
    "/assets/:assetId/maintenance",
    create
);

router.get(
    "/assets/:assetId/maintenance",
    getByAsset
);

/*
    All maintenance for logged-in user
*/

router.get(
    "/",
    getAll
);

router.get(
    "/:maintenanceId",
    getById
);

router.put(
    "/:maintenanceId",
    update
);

router.delete(
    "/:maintenanceId",
    remove
);

module.exports = router;