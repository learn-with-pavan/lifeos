const mongoose = require("mongoose");

const homeSchema = new mongoose.Schema(
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

        type: {
            type: String,
            enum: [
                "HOUSE",
                "APARTMENT",
                "VILLA",
                "OTHER",
            ],
            default: "HOUSE",
        },

        ownership: {
            type: String,
            enum: [
                "OWNED",
                "RENTED",
                "LEASED",
                "OTHER",
            ],
            default: "OWNED",
        },

        address: {
            line1: {
                type: String,
                trim: true,
            },

            line2: {
                type: String,
                trim: true,
            },

            city: {
                type: String,
                trim: true,
            },

            state: {
                type: String,
                trim: true,
            },

            pincode: {
                type: String,
                trim: true,
            },
        },

        description: {
            type: String,
            trim: true,
            default: "",
        },

        purchaseDate: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

const Home = mongoose.model("Home", homeSchema);

module.exports = Home;