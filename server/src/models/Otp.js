const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
    {
        identifier: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            index: true,
        },

        otpHash: {
            type: String,
            required: true,
        },

        purpose: {
            type: String,
            enum: [
                "LOGIN",
                "REGISTER",
                "RESET_PASSWORD",
                "VERIFY_EMAIL",
                "VERIFY_PHONE",
            ],
            required: true,
        },

        attempts: {
            type: Number,
            default: 0,
        },

        expiresAt: {
            type: Date,
            required: true,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

/*
 * MongoDB automatically removes expired OTP documents.
 */
otpSchema.index(
    { expiresAt: 1 },
    { expireAfterSeconds: 0 }
);

/*
 * Only one active OTP for the same
 * identifier + purpose.
 */
otpSchema.index(
    {
        identifier: 1,
        purpose: 1,
    }
);

module.exports = mongoose.model(
    "Otp",
    otpSchema
);