const mongoose = require("mongoose");

const automationExecutionSchema =
    new mongoose.Schema(
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
                index: true,
            },

            automation: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Automation",
                required: true,
                index: true,
            },

            event: {
                type: String,
                required: true,
            },

            entity: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                index: true,
            },

            executionKey: {
                type: String,
                required: true,
                unique: true,
                index: true,
            },

            status: {
                type: String,
                enum: [
                    "PROCESSING",
                    "COMPLETED",
                    "FAILED",
                ],
                default: "PROCESSING",
                index: true,
            },

            attempts: {
                type: Number,
                default: 0,
            },

            nextAttemptAt: {
                type: Date,
                default: null,
            },

            leaseUntil: {
                type: Date,
                default: null,
            },

            lastError: {
                type: String,
                default: null,
            },

            executedAt: {
                type: Date,
                default: Date.now,
            },
        },
        {
            timestamps: true,
        }
    );

module.exports = mongoose.model(
    "AutomationExecution",
    automationExecutionSchema
);