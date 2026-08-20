const mongoose = require("mongoose");

const serviceHistorySchema =
    new mongoose.Schema(
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

            serviceDate: {
                type: Date,
                required: true,
            },

            serviceType: {
                type: String,
                required: true,
                trim: true,
            },

            provider: {
                type: String,
                trim: true,
                default: "",
            },

            cost: {
                type: Number,
                min: 0,
                default: 0,
            },

            description: {
                type: String,
                trim: true,
                default: "",
            },

            notes: {
                type: String,
                trim: true,
                default: "",
            },
        },
        {
            timestamps: true,
        }
    );

module.exports = mongoose.model(
    "ServiceHistory",
    serviceHistorySchema
);