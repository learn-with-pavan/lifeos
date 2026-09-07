const Document =
    require("../models/Document");

const Asset =
    require("../models/Asset");

const {
    uploadBufferToCloudinary,
    deleteFromCloudinary,
} = require("../utils/cloudinary");


// =====================================================
// CLOUDINARY FOLDER
// =====================================================

const getDocumentFolder = () => {

    return process.env.NODE_ENV === "production"
        ? "lifeos/prod/documents"
        : "lifeos/dev/documents";
};


// =====================================================
// UPLOAD FILES
// =====================================================

const uploadDocumentFiles = async (
    files
) => {

    const uploadedFiles = [];


    if (
        !files ||
        files.length === 0
    ) {
        return uploadedFiles;
    }


    try {

        for (const file of files) {

            const result =
                await uploadBufferToCloudinary(
                    file.buffer,
                    {
                        folder:
                            getDocumentFolder(),

                        resource_type:
                            "auto",

                        use_filename:
                            true,

                        unique_filename:
                            true,

                        type:
                            "upload",
                    }
                );


            uploadedFiles.push({
                url:
                    result.secure_url,

                publicId:
                    result.public_id,

                resourceType:
                    result.resource_type,

                format:
                    result.format || "",

                originalName:
                    file.originalname,

                mimeType:
                    file.mimetype,

                size:
                    file.size,
            });
        }


        return uploadedFiles;

    } catch (error) {

        // Cleanup files already uploaded
        for (
            const uploaded
            of uploadedFiles
        ) {

            try {

                await deleteFromCloudinary(
                    uploaded.publicId,
                    uploaded.resourceType
                );

            } catch (cleanupError) {

                console.error(
                    "Cloudinary cleanup failed:",
                    cleanupError
                );
            }
        }


        throw error;
    }
};


// =====================================================
// CREATE
// =====================================================

const createDocument = async (
    userId,
    assetId,
    documentData,
    files
) => {

    const asset =
        await Asset.findOne({
            _id: assetId,
            user: userId,
        });


    if (!asset) {

        const error =
            new Error(
                "Asset not found."
            );

        error.statusCode = 404;

        throw error;
    }


    const uploadedFiles =
        await uploadDocumentFiles(
            files
        );


    try {

        const document =
            await Document.create({

                user:
                    userId,

                asset:
                    assetId,

                type:
                    documentData.type,

                name:
                    documentData.name.trim(),

                description:
                    documentData.description?.trim() ||
                    "",

                documentDate:
                    documentData.documentDate ||
                    null,

                expiryDate:
                    documentData.expiryDate ||
                    null,

                files:
                    uploadedFiles,
            });


        return Document.findById(
            document._id
        ).populate(
            "asset",
            "name category brand model"
        );

    } catch (error) {

        // DB failed -> cleanup Cloudinary
        for (
            const uploaded
            of uploadedFiles
        ) {

            try {

                await deleteFromCloudinary(
                    uploaded.publicId,
                    uploaded.resourceType
                );

            } catch (cleanupError) {

                console.error(
                    "Cloudinary cleanup failed:",
                    cleanupError
                );
            }
        }

        throw error;
    }
};


// =====================================================
// GET ALL
// =====================================================

const getAllDocuments = async (
    userId
) => {

    return Document.find({
        user: userId,
    })
        .populate(
            "asset",
            "name category brand model"
        )
        .sort({
            createdAt: -1,
        });
};


// =====================================================
// GET BY ASSET
// =====================================================

const getDocumentsByAsset = async (
    userId,
    assetId
) => {

    const asset =
        await Asset.findOne({
            _id: assetId,
            user: userId,
        });


    if (!asset) {

        const error =
            new Error(
                "Asset not found."
            );

        error.statusCode = 404;

        throw error;
    }


    return Document.find({
        user: userId,
        asset: assetId,
    })
        .populate(
            "asset",
            "name category brand model"
        )
        .sort({
            createdAt: -1,
        });
};


// =====================================================
// GET BY ID
// =====================================================

const getDocumentById = async (
    userId,
    documentId
) => {

    const document =
        await Document.findOne({
            _id: documentId,
            user: userId,
        })
            .populate(
                "asset",
                "name category brand model"
            );


    if (!document) {

        const error =
            new Error(
                "Document not found."
            );

        error.statusCode = 404;

        throw error;
    }


    return document;
};


// =====================================================
// UPDATE DOCUMENT
//
// Supports:
// 1. Metadata update
// 2. Add additional files
//
// Existing files are preserved.
// =====================================================

const updateDocument = async (
    userId,
    documentId,
    documentData,
    newFiles = []
) => {

    const document =
        await Document.findOne({
            _id: documentId,
            user: userId,
        });


    if (!document) {

        const error =
            new Error(
                "Document not found."
            );

        error.statusCode = 404;

        throw error;
    }


    const allowedFields = [
        "type",
        "name",
        "description",
        "documentDate",
        "expiryDate",
    ];


    const updateData = {};


    for (
        const field
        of allowedFields
    ) {

        if (
            documentData[field] !==
            undefined
        ) {

            let value =
                documentData[field];


            if (
                typeof value ===
                "string"
            ) {

                value =
                    value.trim();
            }


            updateData[field] =
                value;
        }
    }


    if (
        updateData.name !==
        undefined &&
        !updateData.name
    ) {

        const error =
            new Error(
                "Document name cannot be empty."
            );

        error.statusCode = 400;

        throw error;
    }


    // ---------------------------------------------
    // Upload new files if provided
    // ---------------------------------------------

    let uploadedFiles = [];


    if (
        Array.isArray(newFiles) &&
        newFiles.length > 0
    ) {

        uploadedFiles =
            await uploadDocumentFiles(
                newFiles
            );
    }


    try {

        // Add new files to existing files
        if (
            uploadedFiles.length > 0
        ) {

            document.files.push(
                ...uploadedFiles
            );
        }


        // Apply metadata
        Object.assign(
            document,
            updateData
        );


        await document.save();


        return Document.findById(
            document._id
        )
            .populate(
                "asset",
                "name category brand model"
            );

    } catch (error) {

        // If Mongo update fails,
        // remove newly uploaded files.
        for (
            const uploaded
            of uploadedFiles
        ) {

            try {

                await deleteFromCloudinary(
                    uploaded.publicId,
                    uploaded.resourceType
                );

            } catch (cleanupError) {

                console.error(
                    "Cloudinary cleanup failed:",
                    cleanupError
                );
            }
        }


        throw error;
    }
};


// =====================================================
// DELETE COMPLETE DOCUMENT
// =====================================================

const deleteDocument = async (
    userId,
    documentId
) => {

    const document =
        await Document.findOne({
            _id: documentId,
            user: userId,
        });


    if (!document) {

        const error =
            new Error(
                "Document not found."
            );

        error.statusCode = 404;

        throw error;
    }


    // Delete all Cloudinary files
    for (
        const file
        of document.files
    ) {

        try {

            await deleteFromCloudinary(
                file.publicId,
                file.resourceType
            );

        } catch (error) {

            console.error(
                "Failed to delete Cloudinary file:",
                error
            );
        }
    }


    await Document.deleteOne({
        _id: documentId,
        user: userId,
    });


    return document;
};


// =====================================================
// DELETE SINGLE FILE
// =====================================================

const deleteDocumentFile = async (
    userId,
    documentId,
    fileId
) => {

    const document =
        await Document.findOne({
            _id: documentId,
            user: userId,
        });


    if (!document) {

        const error =
            new Error(
                "Document not found."
            );

        error.statusCode = 404;

        throw error;
    }


    const file =
        document.files.id(
            fileId
        );


    if (!file) {

        const error =
            new Error(
                "Document file not found."
            );

        error.statusCode = 404;

        throw error;
    }


    // Never allow zero files
    if (
        document.files.length === 1
    ) {

        const error =
            new Error(
                "A document must contain at least one file."
            );

        error.statusCode = 400;

        throw error;
    }


    await deleteFromCloudinary(
        file.publicId,
        file.resourceType
    );


    file.deleteOne();


    await document.save();


    return Document.findById(
        document._id
    )
        .populate(
            "asset",
            "name category brand model"
        );
};


module.exports = {
    createDocument,
    getAllDocuments,
    getDocumentsByAsset,
    getDocumentById,
    updateDocument,
    deleteDocument,
    deleteDocumentFile,
};