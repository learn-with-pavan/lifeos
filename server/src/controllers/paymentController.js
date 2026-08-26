const {
    getCustomerPayment,
    getCustomerPayments,
} = require("../services/paymentService");


const getPayment = async (
    req,
    res
) => {

    try {

        const payment =
            await getCustomerPayment(
                req.userId,
                req.params.serviceRequestId
            );

        res.status(200).json({
            payment,
        });

    } catch (error) {

        res.status(
            error.statusCode || 500
        ).json({
            message:
                error.message ||
                "Failed to get payment.",
        });
    }
};


const getPayments = async (
    req,
    res
) => {

    try {

        const payments =
            await getCustomerPayments(
                req.userId
            );

        res.status(200).json({
            payments,
        });

    } catch (error) {

        res.status(
            error.statusCode || 500
        ).json({
            message:
                error.message ||
                "Failed to get payments.",
        });
    }
};


module.exports = {
    getPayment,
    getPayments,
};