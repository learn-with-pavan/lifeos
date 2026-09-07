const mongoose = require("mongoose");


const documentFileSchema = new mongoose.Schema(
    {
        url: {
            type: String,
            required: true,
            trim: true,
        },

        publicId: {
            type: String,
            required: true,
            trim: true,
        },

        resourceType: {
            type: String,
            enum: ["image", "raw", "video"],
            required: true,
        },

        format: {
            type: String,
            default: "",
            trim: true,
        },

        originalName: {
            type: String,
            required: true,
            trim: true,
            maxlength: 255,
        },

        mimeType: {
            type: String,
            required: true,
            trim: true,
        },

        size: {
            type: Number,
            default: 0,
            min: 0,
        },
    },
    {
        _id: true,
    }
);


const documentSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        asset: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Asset",
            required: true,
            index: true,
        },

        type: {
            type: String,
            enum: [
                "INVOICE",
                "WARRANTY_CARD",
                "SERVICE_RECEIPT",
                "INSURANCE",
                "PURCHASE_RECEIPT",
                "MANUAL",
                "REGISTRATION",
                "OWNERSHIP",
                "IDENTIFICATION",
                "REPAIR_RECORD",
                "OTHER",
            ],
            required: true,
            index: true,
        },

        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 150,
        },

        description: {
            type: String,
            default: "",
            trim: true,
            maxlength: 1000,
        },

        documentDate: {
            type: Date,
            default: null,
        },

        expiryDate: {
            type: Date,
            default: null,
        },

        files: {
            type: [documentFileSchema],
            required: true,
            validate: {
                validator: function (files) {
                    return (
                        Array.isArray(files) &&
                        files.length > 0
                    );
                },
                message:
                    "A document must contain at least one file.",
            },
        },

        uploadedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);


// Useful for getDocumentsByAsset()
documentSchema.index({
    user: 1,
    asset: 1,
    createdAt: -1,
});


documentSchema.index({
    user: 1,
    type: 1,
    createdAt: -1,
});


const Document = mongoose.model(
    "Document",
    documentSchema
);


module.exports = Document;