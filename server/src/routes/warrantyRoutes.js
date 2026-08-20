const express = require("express");

const {
    create,
    getByAsset,
    update,
    remove,
} = require("../controllers/warrantyController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.post(
    "/assets/:assetId/warranty",
    create
);

router.get(
    "/assets/:assetId/warranty",
    getByAsset
);

router.put(
    "/assets/:assetId/warranty",
    update
);

router.delete(
    "/assets/:assetId/warranty",
    remove
);

module.exports = router;