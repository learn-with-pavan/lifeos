const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        serviceRequest: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ServiceRequest",
            required: true,
            unique: true,
            index: true,
        },

        serviceProvider: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ServiceProvider",
            required: true,
            index: true,
        },

        amount: {
            type: Number,
            required: true,
            min: 0,
        },

        currency: {
            type: String,
            default: "INR",
            uppercase: true,
            trim: true,
        },

        status: {
            type: String,
            enum: [
                "PENDING",
                "PROCESSING",
                "PAID",
                "FAILED",
                "CANCELLED",
                "REFUNDED",
            ],
            default: "PENDING",
            index: true,
        },

        method: {
            type: String,
            enum: [
                "CARD",
                "UPI",
                "NET_BANKING",
                "WALLET",
                "CASH",
                "OTHER",
            ],
            default: null,
        },

        transactionId: {
            type: String,
            default: "",
            trim: true,
            index: true,
        },

        providerPaymentId: {
            type: String,
            default: "",
            trim: true,
        },

        paidAt: {
            type: Date,
            default: null,
        },

        failureReason: {
            type: String,
            default: "",
            trim: true,
        },

        notes: {
            type: String,
            default: "",
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

paymentSchema.index({
    user: 1,
    createdAt: -1,
});

paymentSchema.index({
    serviceProvider: 1,
    status: 1,
});

const Payment = mongoose.model(
    "Payment",
    paymentSchema
);

module.exports = Payment;