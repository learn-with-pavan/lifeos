const {
    createDocument,
    getAllDocuments,
    getDocumentsByAsset,
    getDocumentById,
    updateDocument,
    deleteDocument,
} = require("../services/documentService");


// GET ALL DOCUMENTS
const getAll = async (req, res, next) => {
    try {
        const documents = await getAllDocuments(
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


// CREATE DOCUMENT
const create = async (req, res, next) => {
    try {
        const documentData = req.body || {};
        const assetId = documentData.asset;

        if (!assetId) {
            const error = new Error(
                "Asset is required to create a document"
            );

            error.statusCode = 400;

            throw error;
        }

        const document = await createDocument(
            req.userId,
            assetId,
            documentData
        );

        res.status(201).json({
            success: true,
            message: "Document created successfully",
            document,
        });
    } catch (error) {
        next(error);
    }
};


// GET DOCUMENTS BY ASSET
const getByAsset = async (req, res, next) => {
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


// GET DOCUMENT BY ID
const getById = async (req, res, next) => {
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


// UPDATE DOCUMENT
const update = async (req, res, next) => {
    try {
        const document =
            await updateDocument(
                req.userId,
                req.params.documentId,
                req.body
            );

        res.status(200).json({
            success: true,
            message: "Document updated successfully",
            document,
        });
    } catch (error) {
        next(error);
    }
};


// DELETE DOCUMENT
const remove = async (req, res, next) => {
    try {
        await deleteDocument(
            req.userId,
            req.params.documentId
        );

        res.status(200).json({
            success: true,
            message: "Document deleted successfully",
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
};