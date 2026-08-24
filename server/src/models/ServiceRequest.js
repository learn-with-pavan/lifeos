const mongoose = require("mongoose");

const serviceRequestSchema = new mongoose.Schema(
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
        },

        serviceProvider: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ServiceProvider",
            required: true,
        },

        serviceType: {
            type: String,
            enum: [
                "REPAIR",
                "SERVICE",
                "INSPECTION",
                "OTHER",
            ],
            required: true,
        },

        description: {
            type: String,
            trim: true,
            default: "",
        },

        preferredDate: {
            type: Date,
            required: true,
        },

        preferredTime: {
            type: String,
            trim: true,
            default: "",
        },

        notes: {
            type: String,
            trim: true,
            default: "",
        },

        status: {
            type: String,
            enum: [
                "PENDING",
                "ACCEPTED",
                "SCHEDULED",
                "IN_PROGRESS",
                "COMPLETED",
                "REJECTED",
                "CANCELLED",
            ],
            default: "PENDING",
            index: true,
        },

        scheduling: {
            scheduledDate: {
                type: Date,
                default: null,
            },

            scheduledTime: {
                type: String,
                default: "",
                trim: true,
            },

            durationMinutes: {
                type: Number,
                min: 0,
                default: 0,
            },

            notes: {
                type: String,
                default: "",
                trim: true,
            },
        },
        completion: {
            completedAt: {
                type: Date,
                default: null,
            },

            notes: {
                type: String,
                default: "",
                trim: true,
            },

            serviceCost: {
                type: Number,
                min: 0,
                default: 0,
            },

            partsUsed: {
                type: String,
                default: "",
                trim: true,
            },
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model(
    "ServiceRequest",
    serviceRequestSchema
);