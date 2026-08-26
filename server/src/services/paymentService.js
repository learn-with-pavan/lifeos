const Payment = require("../models/Payment");
const ServiceRequest = require("../models/ServiceRequest");

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


module.exports = {
    getCustomerPayment,
    getCustomerPayments,
};