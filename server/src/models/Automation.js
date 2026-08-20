const mongoose = require("mongoose");

const automationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        name: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            trim: true,
            default: "",
        },

        event: {
            type: String,
            enum: [
                "WARRANTY_EXPIRING",
                "MAINTENANCE_DUE_SOON",
                "MAINTENANCE_OVERDUE",
                "SERVICE_COMPLETED",
                "ASSET_NEEDS_REPAIR",
            ],
            required: true,
        },

        conditions: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },

        actions: {
            type: [
                {
                    type: {
                        type: String,
                        enum: [
                            "CREATE_REMINDER",
                            "SEND_NOTIFICATION",
                        ],
                        required: true,
                    },

                    config: {
                        type: mongoose.Schema.Types.Mixed,
                        default: {},
                    },
                },
            ],
            default: [],
        },

        enabled: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

automationSchema.index({
    user: 1,
    event: 1,
    enabled: 1,
});

automationSchema.index(
    {
        user: 1,
        event: 1,
        name: 1,
    },
    {
        unique: true,
    }
);

module.exports = mongoose.model(
    "Automation",
    automationSchema
);