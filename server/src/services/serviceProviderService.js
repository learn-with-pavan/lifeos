const Payment = require("../models/Payment");
const ServiceProvider = require("../models/ServiceProvider");
const ServiceRequest = require("../models/ServiceRequest");
const { processEvent } = require("./automationService");
const { emitServiceRequestEvent } = require("./serviceRequestAutomationService");

const createServiceProvider = async (
    userId,
    providerData
) => {

    /*
     * A user can have only one
     * provider profile.
     */
    const existingProvider =
        await ServiceProvider.findOne({
            user: userId,
        });

    if (existingProvider) {
        const error = new Error(
            "Service provider profile already exists"
        );

        error.statusCode = 409;

        throw error;
    }

    /*
     * Create provider profile.
     *
     * We explicitly map fields instead
     * of blindly spreading request data.
     *
     * This prevents users from modifying
     * protected fields such as:
     *
     * verificationStatus
     * isActive
     * rating
     */
    const provider =
        await ServiceProvider.create({
            user: userId,

            businessName:
                providerData.businessName,

            description:
                providerData.description || "",

            phone:
                providerData.phone || "",

            email:
                providerData.email || "",

            services:
                providerData.services || [],

            supportedCategories:
                providerData.supportedCategories ||
                [],

            location:
                providerData.location || {
                    type: "Point",
                    coordinates: [0, 0],
                },

            serviceRadiusKm:
                providerData.serviceRadiusKm ??
                10,

            experienceYears:
                providerData.experienceYears ??
                0,

            availability:
                "OFFLINE",

            verificationStatus:
                "PENDING",

            isActive:
                false,
        });

    return provider;
};


/*
 * Get provider profile for the
 * currently authenticated user.
 */
const getMyServiceProvider = async (
    userId
) => {

    const provider =
        await ServiceProvider.findOne({
            user: userId,
        }).populate(
            "user",
            "name email phone profileImage role"
        );;

    if (!provider) {
        const error = new Error(
            "Service provider profile not found"
        );

        error.statusCode = 404;

        throw error;
    }

    return provider;
};


/*
 * Update provider profile.
 *
 * Protected fields are intentionally
 * excluded.
 */
const updateServiceProvider = async (userId, providerData) => {

    const provider =
        await ServiceProvider.findOne({
            user: userId,
        });

    if (!provider) {
        const error = new Error(
            "Service provider profile not found"
        );

        error.statusCode = 404;

        throw error;
    }

    const allowedFields = [
        "businessName",
        "description",
        "phone",
        "email",
        "services",
        "supportedCategories",
        "serviceRadiusKm",
        "experienceYears",
    ];

    for (const field of allowedFields) {

        if (providerData[field] !== undefined) {
            provider[field] = providerData[field];
        }
    }

    if (providerData.location) {

        provider.location = {
            ...provider.location?.toObject?.(),
            ...providerData.location,
            type: "Point",
            coordinates:
                providerData.location.coordinates ||
                provider.location?.coordinates ||
                [0, 0],
        };
    }

    await provider.save();

    return provider;
};

/*
 * Provider can update availability.
 *
 * This will become important later when
 * matching technicians for bookings.
 */
const updateProviderAvailability = async (
    userId,
    availability
) => {

    const allowedStatuses = [
        "AVAILABLE",
        "BUSY",
        "UNAVAILABLE",
    ];

    if (
        !allowedStatuses.includes(
            availability
        )
    ) {

        const error = new Error(
            "Invalid availability status"
        );

        error.statusCode = 400;

        throw error;
    }


    const provider =
        await ServiceProvider.findOne({
            user: userId,
        });

    if (!provider) {

        const error = new Error(
            "Service provider profile not found"
        );

        error.statusCode = 404;

        throw error;
    }


    provider.availability =
        availability;

    await provider.save();

    return provider;
};

const getProviderByUserId = async (
    userId
) => {

    const provider =
        await ServiceProvider.findOne({
            user: userId,
        });

    return provider;
};

const startProviderService = async (requestId, providerId) => {

    const request = await ServiceRequest.findOneAndUpdate(
        {
            _id: requestId,
            serviceProvider: providerId,
            status: "SCHEDULED",
        },
        {
            $set: {
                status: "IN_PROGRESS",
            },
        },
        {
            new: true,
        }
    );

    const populatedRequest =
        await ServiceRequest
            .findById(request._id)
            .populate("asset")
            .populate("user", "name email")
            .populate(
                "serviceProvider",
                "user businessName"
            );


    await emitServiceRequestEvent({
        event:
            "SERVICE_STARTED",

        request:
            populatedRequest,

        customerMessage:
            "Your service request was started by the provider.",
    });

    return request;
};

const completeProviderService = async (requestId, providerId, completionData) => {
    const request = await ServiceRequest.findOneAndUpdate(
        {
            _id: requestId,
            serviceProvider: providerId,
            status: "IN_PROGRESS",
        },
        {
            $set: {
                status: "COMPLETED",

                completion: {
                    completedAt: new Date(),

                    notes:
                        completionData
                            ?.completionNotes
                            ?.trim() || "",

                    serviceCost: completionData?.serviceCost || 0,

                    partsUsed:
                        completionData
                            ?.partsUsed
                            ?.trim() || "",
                },
            },
        },
        {
            new: true,
            runValidators: true,
        }
    );

    if (!request) {

        const error =
            new Error(
                "Service request cannot be completed in its current state."
            );

        error.statusCode = 400;

        throw error;
    }


    if (completionData?.serviceCost > 0) {

        let payment =
            await Payment.findOne({
                serviceRequest:
                    request._id,
            });

        if (!payment) {

            payment = await Payment.create({

                user:
                    request.user,

                serviceRequest:
                    request._id,

                serviceProvider:
                    request.serviceProvider,

                amount:
                    completionData?.serviceCost,

                currency:
                    "INR",

                status:
                    "PENDING",
            });
        }


        await processEvent(
            "PAYMENT_CREATED",
            {
                userId: request.user,

                assetId: request.asset,

                entityId: payment._id,

                paymentId: payment._id,

                serviceRequestId: request._id,

                paymentAmount: completionData?.serviceCost,

                recipientRole: "CUSTOMER",

                message:
                    `Payment of ₹${completionData?.serviceCost} is due for your completed service.`,
            }
        );
    }

    /*
     * Populate the request before
     * sending the completion event.
     *
     * The notification system needs:
     * - customer
     * - asset
     * - service provider
     * - service request
     */
    const populatedRequest =
        await ServiceRequest
            .findById(request._id)
            .populate(
                "asset",
                "name category brand model"
            )
            .populate(
                "user",
                "name email"
            )
            .populate(
                "serviceProvider",
                "user businessName"
            );


    /*
     * Emit SERVICE_COMPLETED event.
     *
     * This goes through:
     *
     * Service Request
     *       ↓
     * Automation Engine
     *       ↓
     * Notification Engine
     */
    await emitServiceRequestEvent({
        event:
            "SERVICE_COMPLETED",

        request:
            populatedRequest,

        customerMessage:
            "Your service has been completed. How was your experience? Please rate your service.",
    });


    return request;
};

const getProviderDashboardData = async (providerId) => {

    const provider =
        await ServiceProvider.findById(
            providerId
        )
            .select(
                "businessName availability verificationStatus isActive rating"
            )
            .lean();


    if (!provider) {

        const error =
            new Error(
                "Service provider profile not found."
            );

        error.statusCode = 404;

        throw error;
    }


    /*
     * STATUS COUNTS
     */

    const statusCounts =
        await ServiceRequest.aggregate([

            {
                $match: {
                    serviceProvider:
                        providerId,
                },
            },

            {
                $group: {
                    _id: "$status",
                    count: {
                        $sum: 1,
                    },
                },
            },

        ]);


    const counts = {
        pending: 0,
        accepted: 0,
        scheduled: 0,
        inProgress: 0,
        completed: 0,
        rejected: 0,
        cancelled: 0,
    };


    statusCounts.forEach(
        (item) => {

            switch (item._id) {

                case "PENDING":
                    counts.pending =
                        item.count;
                    break;

                case "ACCEPTED":
                    counts.accepted =
                        item.count;
                    break;

                case "SCHEDULED":
                    counts.scheduled =
                        item.count;
                    break;

                case "IN_PROGRESS":
                    counts.inProgress =
                        item.count;
                    break;

                case "COMPLETED":
                    counts.completed =
                        item.count;
                    break;

                case "REJECTED":
                    counts.rejected =
                        item.count;
                    break;

                case "CANCELLED":
                    counts.cancelled =
                        item.count;
                    break;

                default:
                    break;
            }
        }
    );


    /*
     * UPCOMING SERVICES
     */

    const upcomingServices =
        await ServiceRequest.find({
            serviceProvider:
                providerId,

            status: "SCHEDULED",

            "scheduling.scheduledDate": {
                $gte: new Date(),
            },
        })
            .populate(
                "asset",
                "name category brand model"
            )
            .populate(
                "user",
                "name email"
            )
            .sort({
                "scheduling.scheduledDate": 1,
            })
            .limit(5)
            .lean();


    /*
     * RECENT REQUESTS
     */

    const recentRequests =
        await ServiceRequest.find({
            serviceProvider:
                providerId,
        })
            .populate(
                "asset",
                "name category brand model"
            )
            .populate(
                "user",
                "name email"
            )
            .sort({
                createdAt: -1,
            })
            .limit(5)
            .lean();


    /*
     * TODAY'S SERVICES
     */

    const startOfToday =
        new Date();

    startOfToday.setHours(
        0,
        0,
        0,
        0
    );


    const endOfToday =
        new Date();

    endOfToday.setHours(
        23,
        59,
        59,
        999
    );


    const todayServices =
        await ServiceRequest.find({
            serviceProvider:
                providerId,

            "scheduling.scheduledDate": {
                $gte: startOfToday,
                $lte: endOfToday,
            },

            status: {
                $nin: [
                    "REJECTED",
                    "CANCELLED",
                ],
            },
        })
            .populate(
                "asset",
                "name category brand model"
            )
            .populate(
                "user",
                "name email"
            )
            .sort({
                "scheduling.scheduledTime": 1,
            })
            .lean();


    /*
     * RETURN DASHBOARD
     */

    return {

        provider,

        counts,

        todayServices,

        upcomingServices,

        recentRequests,

    };
};

const getProviderSchedule = async (providerId, startDate, endDate) => {

    const start =
        startDate
            ? new Date(startDate)
            : new Date();


    if (!startDate) {
        start.setHours(0, 0, 0, 0);
    }


    const end =
        endDate
            ? new Date(endDate)
            : new Date();


    if (!endDate) {
        end.setDate(end.getDate() + 30);
        end.setHours(23, 59, 59, 999);
    }


    const requests =
        await ServiceRequest.find({
            serviceProvider: providerId,

            "scheduling.scheduledDate": {
                $gte: start,
                $lte: end,
            },

            status: {
                $in: [
                    "SCHEDULED",
                    "IN_PROGRESS",
                    "COMPLETED",
                ],
            },
        })
            .populate(
                "asset",
                "name category brand model"
            )
            .populate(
                "user",
                "name email"
            )
            .sort({
                "scheduling.scheduledDate": 1,
                "scheduling.scheduledTime": 1,
            })
            .lean();


    return requests;
};

const updateProviderSettings = async (userId, settings) => {

    const provider =
        await ServiceProvider.findOne({
            user: userId,
        });

    if (!provider) {

        const error =
            new Error(
                "Service provider profile not found."
            );

        error.statusCode = 404;

        throw error;
    }

    if (!settings || typeof settings !== "object") {

        const error =
            new Error(
                "Invalid provider settings."
            );

        error.statusCode = 400;

        throw error;
    }

    if (
        settings.notifications
    ) {

        provider.settings.notifications = {
            ...provider.settings?.notifications,
            ...settings.notifications,
        };
    }

    if (
        settings.requestPreferences
    ) {

        provider.settings.requestPreferences = {
            ...provider.settings?.requestPreferences,
            ...settings.requestPreferences,
        };
    }

    await provider.save();

    return provider;
};

const updateProviderLocation = async (
    userId,
    latitude,
    longitude
) => {

    const provider =
        await ServiceProvider.findOne({
            user: userId,
        });

    if (!provider) {

        const error =
            new Error(
                "Service provider profile not found."
            );

        error.statusCode = 404;

        throw error;
    }

    provider.location = {
        ...provider.location?.toObject?.(),
        type: "Point",
        coordinates: [
            Number(longitude),
            Number(latitude),
        ],
    };

    await provider.save();

    return provider;
};

module.exports = {
    createServiceProvider,
    getMyServiceProvider,
    updateServiceProvider,
    updateProviderAvailability,
    getProviderByUserId,
    startProviderService,
    completeProviderService,
    getProviderDashboardData,
    getProviderSchedule,
    updateProviderSettings,
    updateProviderLocation
};