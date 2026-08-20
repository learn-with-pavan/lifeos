const mongoose = require("mongoose");

const assetSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        home: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Home",
            default: null,
        },

        name: {
            type: String,
            required: true,
            trim: true,
        },

        category: {
            type: String,
            required: true,
            trim: true,
        },

        brand: {
            type: String,
            trim: true,
        },

        model: {
            type: String,
            trim: true,
        },

        purchaseDate: {
            type: Date,
        },

        purchasePrice: {
            type: Number,
            min: 0,
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

const Asset = mongoose.model("Asset", assetSchema);

module.exports = Asset;