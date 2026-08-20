const mongoose = require("mongoose");

const reminderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        asset: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Asset",
            required: true,
        },

        warranty: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Warranty",
            required: true,
        },

        type: {
            type: String,
            enum: [
                "WARRANTY_EXPIRY",
            ],
            required: true,
        },

        remindBeforeDays: {
            type: Number,
            required: true,
            default: 30,
        },

        reminderDate: {
            type: Date,
            required: true,
        },

        status: {
            type: String,
            enum: [
                "PENDING",
                "SENT",
                "CANCELLED",
            ],
            default: "PENDING",
        },

        sentAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

reminderSchema.index(
    {
        user: 1,
        asset: 1,
        warranty: 1,
        type: 1,
    },
    {
        unique: true,
        partialFilterExpression: {
            status: {
                $in: [
                    "PENDING",
                    "SENT",
                ],
            },
        },
    }
);

reminderSchema.index({ status: 1, reminderDate: 1 });

const Reminder = mongoose.model(
    "Reminder",
    reminderSchema
);

module.exports = Reminder;