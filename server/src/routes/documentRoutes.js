const express = require("express");

const {
    getAll,
    create,
    getByAsset,
    getById,
    update,
    remove,
    deleteFile,
} = require("../controllers/documentController");

const authMiddleware =
    require("../middleware/authMiddleware");

const documentUpload =
    require("../middleware/documentUpload");


const router = express.Router();


router.use(
    authMiddleware
);


// =====================================================
// GET ALL
// =====================================================

router.get(
    "/",
    getAll
);


// =====================================================
// CREATE
// =====================================================

router.post(
    "/",
    documentUpload.array("files", 10),
    create
);


// =====================================================
// GET BY ASSET
// =====================================================

router.get(
    "/assets/:assetId",
    getByAsset
);


// =====================================================
// GET BY ID
// =====================================================

router.get(
    "/:documentId",
    getById
);


// =====================================================
// UPDATE
//
// IMPORTANT:
// PUT now accepts files too.
// =====================================================

router.put(
    "/:documentId",
    documentUpload.array("files", 10),
    update
);


// =====================================================
// DELETE DOCUMENT
// =====================================================

router.delete(
    "/:documentId",
    remove
);


// =====================================================
// DELETE SINGLE FILE
// =====================================================

router.delete(
    "/:documentId/files/:fileId",
    deleteFile
);


module.exports = router;