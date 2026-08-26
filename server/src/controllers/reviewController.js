const {
    createReview,
    getReviewForServiceRequest,
    getProviderReviews,
    getProviderRating,
} = require("../services/reviewService");


const create = async (
    req,
    res,
    next
) => {

    try {

        const {
            serviceRequestId,
            rating,
            comment,
        } = req.body;

        const review =
            await createReview(
                req.userId,
                serviceRequestId,
                rating,
                comment
            );

        return res.status(201).json({
            success: true,
            message:
                "Review submitted successfully.",
            review,
        });

    } catch (error) {

        next(error);

    }
};


const getForServiceRequest =
    async (
        req,
        res,
        next
    ) => {

        try {

            const review =
                await getReviewForServiceRequest(
                    req.userId,
                    req.params.serviceRequestId
                );

            return res.status(200).json({
                success: true,
                review,
            });

        } catch (error) {

            next(error);

        }
    };


const getProvider =
    async (
        req,
        res,
        next
    ) => {

        try {

            const reviews =
                await getProviderReviews(
                    req.params.serviceProviderId
                );

            return res.status(200).json({
                success: true,
                reviews,
            });

        } catch (error) {

            next(error);

        }
    };


const getProviderRatingSummary =
    async (
        req,
        res,
        next
    ) => {

        try {

            const rating =
                await getProviderRating(
                    req.params.serviceProviderId
                );

            return res.status(200).json({
                success: true,
                rating,
            });

        } catch (error) {

            next(error);

        }
    };


module.exports = {
    create,
    getForServiceRequest,
    getProvider,
    getProviderRatingSummary,
};