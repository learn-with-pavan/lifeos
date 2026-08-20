const mongoose = require("mongoose");

const maintenanceSchema = new mongoose.Schema(
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

        title: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            trim: true,
        },

        dueDate: {
            type: Date,
            required: true,
        },

        estimatedCost: {
            type: Number,
            min: 0,
            default: 0,
        },

        notes: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

maintenanceSchema.index({ dueDate: 1 });

const Maintenance = mongoose.model(
    "Maintenance",
    maintenanceSchema
);

module.exports = Maintenance;