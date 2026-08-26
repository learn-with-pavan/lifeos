const mongoose = require("mongoose");
const Review = require("../models/Review");
const ServiceRequest = require("../models/ServiceRequest");
const ServiceProvider = require("../models/ServiceProvider");

const createReview = async (
    userId,
    serviceRequestId,
    rating,
    comment
) => {

    const request =
        await ServiceRequest.findOne({
            _id: serviceRequestId,
            user: userId,
        })
            .populate(
                "serviceProvider",
                "user businessName"
            );

    if (!request) {
        const error = new Error(
            "Service request not found"
        );

        error.statusCode = 404;

        throw error;
    }

    if (request.status !== "COMPLETED") {
        const error = new Error(
            "Review can only be submitted after service completion."
        );

        error.statusCode = 400;

        throw error;
    }

    if (!request.serviceProvider) {
        const error = new Error(
            "Service provider not found."
        );

        error.statusCode = 400;

        throw error;
    }

    const existingReview =
        await Review.findOne({
            serviceRequest: request._id,
        });

    if (existingReview) {
        const error = new Error(
            "You have already reviewed this service."
        );

        error.statusCode = 409;

        throw error;
    }

    const numericRating =
        Number(rating);

    if (
        !Number.isInteger(numericRating) ||
        numericRating < 1 ||
        numericRating > 5
    ) {
        const error = new Error(
            "Rating must be between 1 and 5."
        );

        error.statusCode = 400;

        throw error;
    }

    /*
     * Create review
     */
    const review =
        await Review.create({
            user: userId,

            serviceProvider:
                request.serviceProvider._id,

            serviceRequest:
                request._id,

            rating: numericRating,

            comment:
                comment?.trim() || "",
        });


    /*
     * Recalculate provider rating
     *
     * We calculate from the Review collection
     * so the provider's stored rating always
     * represents the actual reviews.
     */
    const ratingResult =
        await Review.aggregate([
            {
                $match: {
                    serviceProvider:
                        request.serviceProvider._id,
                },
            },

            {
                $group: {
                    _id: "$serviceProvider",

                    averageRating: {
                        $avg: "$rating",
                    },

                    totalReviews: {
                        $sum: 1,
                    },
                },
            },
        ]);


    const averageRating =
        ratingResult.length
            ? Number(
                ratingResult[0]
                    .averageRating
                    .toFixed(1)
            )
            : 0;

    const totalReviews =
        ratingResult.length
            ? ratingResult[0].totalReviews
            : 0;


    /*
     * Update ServiceProvider
     */
    await ServiceProvider.findByIdAndUpdate(
        request.serviceProvider._id,
        {
            $set: {
                "rating.average":
                    averageRating,

                "rating.count":
                    totalReviews,
            },
        },
        {
            new: true,
        }
    );


    /*
     * Return created review
     */
    return Review.findById(
        review._id
    )
        .populate(
            "serviceProvider",
            "businessName rating"
        )
        .populate(
            "user",
            "name"
        );
};


const getReviewForServiceRequest =
    async (
        userId,
        serviceRequestId
    ) => {

        const request =
            await ServiceRequest.findOne({
                _id: serviceRequestId,
                user: userId,
            });

        if (!request) {
            const error = new Error(
                "Service request not found"
            );

            error.statusCode = 404;

            throw error;
        }

        return Review.findOne({
            serviceRequest:
                serviceRequestId,
            user: userId,
        })
            .populate(
                "serviceProvider",
                "businessName"
            );
    };


const getProviderReviews =
    async (
        serviceProviderId
    ) => {

        return Review.find({
            serviceProvider:
                serviceProviderId,
        })
            .populate(
                "user",
                "name"
            )
            .sort({
                createdAt: -1,
            });
    };


const getProviderRating =
    async (
        serviceProviderId
    ) => {

        const result =
            await Review.aggregate([
                {
                    $match: {
                        serviceProvider:
                            new mongoose.Types.ObjectId(
                                serviceProviderId
                            ),
                    },
                },
                {
                    $group: {
                        _id: "$serviceProvider",

                        averageRating: {
                            $avg: "$rating",
                        },

                        totalReviews: {
                            $sum: 1,
                        },
                    },
                },
            ]);

        if (!result.length) {
            return {
                averageRating: 0,
                totalReviews: 0,
            };
        }

        return {
            averageRating:
                Number(
                    result[0]
                        .averageRating
                        .toFixed(1)
                ),

            totalReviews:
                result[0].totalReviews,
        };
    };


module.exports = {
    createReview,
    getReviewForServiceRequest,
    getProviderReviews,
    getProviderRating,
};