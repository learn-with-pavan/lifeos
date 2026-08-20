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

        address: {
            type: String,
            trim: true,
            default: "",
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