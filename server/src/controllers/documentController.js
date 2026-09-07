const {
    createDocument,
    getAllDocuments,
    getDocumentsByAsset,
    getDocumentById,
    updateDocument,
    deleteDocument,
    deleteDocumentFile,
} = require("../services/documentService");


// =====================================================
// GET ALL DOCUMENTS
// =====================================================

const getAll = async (
    req,
    res,
    next
) => {
    try {

        const documents =
            await getAllDocuments(
                req.userId
            );

        res.status(200).json({
            success: true,
            documents,
        });

    } catch (error) {
        next(error);
    }
};


// =====================================================
// CREATE DOCUMENT
// =====================================================

const create = async (
    req,
    res,
    next
) => {
    try {

        const {
            asset,
            type,
            name,
            description,
            documentDate,
            expiryDate,
        } = req.body;


        if (!asset) {
            const error =
                new Error(
                    "Asset is required."
                );

            error.statusCode = 400;
            throw error;
        }


        if (!type) {
            const error =
                new Error(
                    "Document type is required."
                );

            error.statusCode = 400;
            throw error;
        }


        if (!name?.trim()) {
            const error =
                new Error(
                    "Document name is required."
                );

            error.statusCode = 400;
            throw error;
        }


        if (
            !req.files ||
            req.files.length === 0
        ) {
            const error =
                new Error(
                    "At least one file is required."
                );

            error.statusCode = 400;
            throw error;
        }


        const document =
            await createDocument(
                req.userId,
                asset,
                {
                    type,
                    name,
                    description,
                    documentDate,
                    expiryDate,
                },
                req.files
            );


        res.status(201).json({
            success: true,
            message:
                "Document created successfully.",
            document,
        });

    } catch (error) {
        next(error);
    }
};


// =====================================================
// GET DOCUMENTS BY ASSET
// =====================================================

const getByAsset = async (
    req,
    res,
    next
) => {
    try {

        const documents =
            await getDocumentsByAsset(
                req.userId,
                req.params.assetId
            );

        res.status(200).json({
            success: true,
            documents,
        });

    } catch (error) {
        next(error);
    }
};


// =====================================================
// GET DOCUMENT BY ID
// =====================================================

const getById = async (
    req,
    res,
    next
) => {
    try {

        const document =
            await getDocumentById(
                req.userId,
                req.params.documentId
            );

        res.status(200).json({
            success: true,
            document,
        });

    } catch (error) {
        next(error);
    }
};


// =====================================================
// UPDATE DOCUMENT
//
// Supports:
// - metadata update
// - adding additional files
// =====================================================

const update = async (
    req,
    res,
    next
) => {
    try {

        const document =
            await updateDocument(
                req.userId,
                req.params.documentId,
                req.body,
                req.files || []
            );


        res.status(200).json({
            success: true,
            message:
                req.files?.length
                    ? "Document updated and files added successfully."
                    : "Document updated successfully.",
            document,
        });

    } catch (error) {
        next(error);
    }
};


// =====================================================
// DELETE COMPLETE DOCUMENT
// =====================================================

const remove = async (
    req,
    res,
    next
) => {
    try {

        await deleteDocument(
            req.userId,
            req.params.documentId
        );

        res.status(200).json({
            success: true,
            message:
                "Document deleted successfully.",
        });

    } catch (error) {
        next(error);
    }
};


// =====================================================
// DELETE SINGLE FILE
// =====================================================

const deleteFile = async (
    req,
    res,
    next
) => {
    try {

        const document =
            await deleteDocumentFile(
                req.userId,
                req.params.documentId,
                req.params.fileId
            );

        res.status(200).json({
            success: true,
            message:
                "Document file deleted successfully.",
            document,
        });

    } catch (error) {
        next(error);
    }
};


module.exports = {
    getAll,
    create,
    getByAsset,
    getById,
    update,
    remove,
    deleteFile,
};