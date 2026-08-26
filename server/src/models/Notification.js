const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
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
            default: null,
        },

        serviceRequest: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ServiceRequest",
            default: null,
            index: true,
        },

        payment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Payment",
            default: null,
            index: true,
        },

        /*
         * Warranty reminder notifications
         * will have this value.
         *
         * Direct automation notifications
         * can have null.
         */
        reminder: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Reminder",
        },

        automationKey: {
            type: String,
            default: undefined,
        },

        type: {
            type: String,

            enum: [
                // Asset / Warranty
                "WARRANTY_EXPIRY",
                "ASSET_NEEDS_REPAIR",

                // Maintenance
                "MAINTENANCE_DUE_SOON",
                "MAINTENANCE_OVERDUE",

                // Service
                "SERVICE_COMPLETED",

                // Service Request
                "SERVICE_REQUEST_CREATED",
                "SERVICE_REQUEST_ACCEPTED",
                "SERVICE_REQUEST_REJECTED",
                "SERVICE_REQUEST_SCHEDULED",
                "SERVICE_REQUEST_RESCHEDULED",
                "SERVICE_REQUEST_CANCELLED",
                "SERVICE_REQUEST_STARTED",
                "SERVICE_REVIEW_REQUEST",

                // Payment
                "PAYMENT_CREATED",
                "PAYMENT_SUCCESS",
                "PAYMENT_FAILED",
                "PAYMENT_REFUNDED",
            ],

            required: true,
        },

        title: {
            type: String,
            required: true,
            trim: true,
        },

        message: {
            type: String,
            required: true,
            trim: true,
        },

        isRead: {
            type: Boolean,
            default: false,
            index: true,
        },

        readAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

notificationSchema.index(
    { reminder: 1 },
    { unique: true, sparse: true }
);

notificationSchema.index(
    { automationKey: 1 },
    { unique: true, sparse: true }
);

notificationSchema.index(
    { user: 1, createdAt: -1 }
);

notificationSchema.index(
    { user: 1, isRead: 1 }
);

const Notification = mongoose.model(
    "Notification",
    notificationSchema
);

module.exports = Notification;