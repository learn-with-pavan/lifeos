const Payment = require("../models/Payment");
const ServiceRequest = require("../models/ServiceRequest");
const { processEvent } = require("./automationService");

const getCustomerPayment = async (
    userId,
    serviceRequestId
) => {

    const request =
        await ServiceRequest.findOne({
            _id: serviceRequestId,
            user: userId,
        });

    if (!request) {
        const error =
            new Error(
                "Service request not found."
            );

        error.statusCode = 404;

        throw error;
    }

    const payment =
        await Payment.findOne({
            serviceRequest: request._id,
            user: userId,
        })
            .populate(
                "serviceRequest"
            )
            .populate(
                "serviceProvider",
                "businessName"
            );

    if (!payment) {
        const error =
            new Error(
                "Payment not found."
            );

        error.statusCode = 404;

        throw error;
    }

    return payment;
};


const getCustomerPayments = async (
    userId
) => {

    return Payment.find({
        user: userId,
    })
        .populate(
            "serviceRequest",
            "serviceType status"
        )
        .populate(
            "serviceProvider",
            "businessName"
        )
        .sort({
            createdAt: -1,
        });
};

const processCustomerPayment = async (
    userId,
    paymentId,
    paymentData
) => {

    const payment =
        await Payment.findOne({
            _id: paymentId,
            user: userId,
        });

    if (!payment) {
        const error =
            new Error(
                "Payment not found."
            );

        error.statusCode = 404;

        throw error;
    }


    if (payment.status === "PAID") {
        const error =
            new Error(
                "This payment has already been completed."
            );

        error.statusCode = 400;

        throw error;
    }


    if (
        payment.status === "CANCELLED" ||
        payment.status === "REFUNDED"
    ) {
        const error =
            new Error(
                `Payment cannot be processed because it is ${payment.status.toLowerCase()}.`
            );

        error.statusCode = 400;

        throw error;
    }


    const method =
        paymentData?.method;


    const allowedMethods = [
        "CARD",
        "UPI",
        "NET_BANKING",
        "WALLET",
    ];


    if (
        !allowedMethods.includes(method)
    ) {
        const error =
            new Error(
                "Please select a valid payment method."
            );

        error.statusCode = 400;

        throw error;
    }


    /*
     * Prototype payment processing.
     *
     * Real payment gateway will replace
     * this section later.
     */

    payment.status = "PROCESSING";
    payment.method = method;

    await payment.save();


    /*
     * Simulate successful gateway response.
     */

    payment.status = "PAID";

    payment.paidAt =
        new Date();

    payment.transactionId =
        `LIFEOS-${Date.now()}-${payment._id
            .toString()
            .slice(-6)
            .toUpperCase()}`;

    payment.providerPaymentId =
        `DEMO-${Date.now()}`;

    await payment.save();

    /*
 * PAYMENT COMPLETED EVENT
 *
 * Payment
 *    ↓
 * Automation Engine
 *    ↓
 * Notification Engine
 */

    await processEvent(
        "PAYMENT_COMPLETED",
        {
            userId:
                request.user,

            assetId:
                request.asset,

            entityId:
                payment._id,

            paymentId:
                payment._id,

            serviceRequestId:
                request._id,

            recipientRole:
                "CUSTOMER",

            message:
                `Your payment of ₹${payment.amount} for the completed service was successful.`,
        }
    );

    return Payment.findById(
        payment._id
    )
        .populate(
            "serviceRequest"
        )
        .populate(
            "serviceProvider",
            "businessName"
        );
};

module.exports = {
    getCustomerPayment,
    getCustomerPayments,
    processCustomerPayment
};

