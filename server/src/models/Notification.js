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
                "WARRANTY_EXPIRY",
                "MAINTENANCE_DUE_SOON",
                "MAINTENANCE_OVERDUE",
                "SERVICE_COMPLETED",
                "ASSET_NEEDS_REPAIR",
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