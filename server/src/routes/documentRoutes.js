const express = require("express");

const {
    getAll,
    create,
    getByAsset,
    getById,
    update,
    remove,
} = require("../controllers/documentController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.get("/", getAll);

router.post("/", create);

router.get("/assets/:assetId", getByAsset);

router.get("/:documentId", getById);

router.put("/:documentId", update);

router.delete("/:documentId", remove);

module.exports = router;