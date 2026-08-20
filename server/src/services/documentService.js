const Document = require("../models/Document");
const Asset = require("../models/Asset");

const createDocument = async (
    userId,
    assetId,
    documentData
) => {
    const asset = await Asset.findOne({
        _id: assetId,
        user: userId,
    });

    if (!asset) {
        const error = new Error("Asset not found");
        error.statusCode = 404;
        throw error;
    }

    return Document.create({
        user: userId,
        asset: assetId,
        ...documentData,
    });
};


// Get all documents for logged-in user
const getAllDocuments = async (userId) => {
    return Document.find({
        user: userId,
    })
        .populate("asset", "name category brand model")
        .sort({
            createdAt: -1,
        });
};


// Get documents for a specific asset
const getDocumentsByAsset = async (
    userId,
    assetId
) => {
    const asset = await Asset.findOne({
        _id: assetId,
        user: userId,
    });

    if (!asset) {
        const error = new Error("Asset not found");
        error.statusCode = 404;
        throw error;
    }

    return Document.find({
        user: userId,
        asset: assetId,
    }).sort({
        createdAt: -1,
    });
};


const getDocumentById = async (
    userId,
    documentId
) => {
    const document = await Document.findOne({
        _id: documentId,
        user: userId,
    });

    if (!document) {
        const error = new Error("Document not found");
        error.statusCode = 404;
        throw error;
    }

    return document;
};


const updateDocument = async (
    userId,
    documentId,
    documentData
) => {
    const document =
        await Document.findOneAndUpdate(
            {
                _id: documentId,
                user: userId,
            },
            documentData,
            {
                returnDocument: "after",
                runValidators: true,
            }
        );

    if (!document) {
        const error = new Error("Document not found");
        error.statusCode = 404;
        throw error;
    }

    return document;
};


const deleteDocument = async (
    userId,
    documentId
) => {
    const document =
        await Document.findOneAndDelete({
            _id: documentId,
            user: userId,
        });

    if (!document) {
        const error = new Error("Document not found");
        error.statusCode = 404;
        throw error;
    }

    return document;
};


module.exports = {
    createDocument,
    getAllDocuments,
    getDocumentsByAsset,
    getDocumentById,
    updateDocument,
    deleteDocument,
};