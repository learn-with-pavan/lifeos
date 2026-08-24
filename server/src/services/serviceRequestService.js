const Asset = require("../models/Asset");
const ServiceProvider = require("../models/ServiceProvider");
const ServiceRequest = require("../models/ServiceRequest");


const createServiceRequest = async (
    userId,
    requestData
) => {

    const {
        asset,
        serviceProvider,
        serviceType,
        description,
        preferredDate,
        preferredTime,
        notes,
    } = requestData;


    /*
     * Verify asset belongs to
     * the authenticated user.
     */

    const existingAsset =
        await Asset.findOne({
            _id: asset,
            user: userId,
        });

    if (!existingAsset) {

        const error = new Error(
            "Asset not found"
        );

        error.statusCode = 404;

        throw error;
    }


    /*
     * Verify service provider exists.
     */

    const existingProvider =
        await ServiceProvider.findById(
            serviceProvider
        );

    if (!existingProvider) {

        const error = new Error(
            "Service provider not found"
        );

        error.statusCode = 404;

        throw error;
    }


    /*
     * Create request.
     */

    const serviceRequest =
        await ServiceRequest.create({
            user: userId,
            asset,
            serviceProvider,
            serviceType,
            description,
            preferredDate,
            preferredTime,
            notes,
            status: "PENDING",
        });


    return serviceRequest;
};


const getServiceRequests = async (
    userId
) => {

    return ServiceRequest.find({
        user: userId,
    })
        .populate(
            "asset",
            "name category brand model"
        )
        .populate(
            "serviceProvider"
        )
        .sort({
            createdAt: -1,
        });
};


const getServiceRequestById = async (
    userId,
    requestId
) => {

    const serviceRequest =
        await ServiceRequest.findOne({
            _id: requestId,
            user: userId,
        })
            .populate(
                "asset",
                "name category brand model"
            )
            .populate(
                "serviceProvider"
            );


    if (!serviceRequest) {

        const error = new Error(
            "Service request not found"
        );

        error.statusCode = 404;

        throw error;
    }


    return serviceRequest;
};


const getActiveProvider = async (
    userId
) => {
    const provider = await ServiceProvider.findOne({
        user: userId,
        isActive: true,
    });

    if (!provider) {
        const error = new Error(
            "Service provider profile not found."
        );

        error.statusCode = 404;

        throw error;
    }

    return provider;
};


const getProviderIncomingRequests = async (
    userId
) => {
    const provider = await getActiveProvider(userId);

    const requests = await ServiceRequest
        .find({
            serviceProvider: provider._id,
            status: "PENDING",
        })
        .populate("asset")
        .populate("user", "name email")
        .sort({
            createdAt: -1,
        });

    return {
        requests,
        count: requests.length,
    };
};


const getProviderRequest = async (
    userId,
    requestId
) => {
    const provider = await getActiveProvider(userId);

    const request = await ServiceRequest
        .findOne({
            _id: requestId,
            serviceProvider: provider._id,
        })
        .populate("asset")
        .populate("user", "name email");

    if (!request) {
        const error = new Error(
            "Service request not found."
        );

        error.statusCode = 404;

        throw error;
    }

    return request;
};


const updateProviderRequestStatus = async (
    userId,
    requestId,
    status
) => {
    const provider = await getActiveProvider(userId);

    const request = await ServiceRequest.findOne({
        _id: requestId,
        serviceProvider: provider._id,
    });

    if (!request) {
        const error = new Error(
            "Service request not found."
        );

        error.statusCode = 404;

        throw error;
    }

    if (request.status !== "PENDING") {
        const error = new Error(
            `Request is already ${request.status.toLowerCase()}.`
        );

        error.statusCode = 400;

        throw error;
    }

    request.status = status;
    await request.save();

    return request;
};


const acceptProviderRequest = async (
    userId,
    requestId
) => updateProviderRequestStatus(
    userId,
    requestId,
    "ACCEPTED"
);


const rejectProviderRequest = async (
    userId,
    requestId
) => updateProviderRequestStatus(
    userId,
    requestId,
    "REJECTED"
);


//Schedling Service
const scheduleServiceRequest = async (
    requestId,
    userId,
    schedulingData
) => {

    const provider =
        await ServiceProvider.findOne({
            user: userId,
            isActive: true,
        });


    if (!provider) {

        const error =
            new Error(
                "Service provider profile not found."
            );

        error.statusCode = 404;

        throw error;
    }


    const {
        scheduledDate,
        scheduledTime,
        durationMinutes,
        notes,
    } = schedulingData;


    if (!scheduledDate) {

        const error =
            new Error(
                "Scheduled date is required."
            );

        error.statusCode = 400;

        throw error;
    }


    if (!scheduledTime) {

        const error =
            new Error(
                "Scheduled time is required."
            );

        error.statusCode = 400;

        throw error;
    }


    const parsedDate =
        new Date(scheduledDate);


    if (
        Number.isNaN(
            parsedDate.getTime()
        )
    ) {

        const error =
            new Error(
                "Invalid scheduled date."
            );

        error.statusCode = 400;

        throw error;
    }


    const request =
        await ServiceRequest.findOneAndUpdate(
            {
                _id: requestId,

                serviceProvider:
                    provider._id,

                status: "ACCEPTED",
            },

            {
                $set: {
                    status: "SCHEDULED",

                    "scheduling.scheduledDate":
                        parsedDate,

                    "scheduling.scheduledTime":
                        scheduledTime,

                    "scheduling.durationMinutes":
                        durationMinutes || 0,

                    "scheduling.notes":
                        notes || "",
                },
            },

            {
                new: true,
            }
        );


    if (!request) {

        const error =
            new Error(
                "Only accepted service requests can be scheduled."
            );

        error.statusCode = 400;

        throw error;
    }


    return request;
};

module.exports = {
    createServiceRequest,
    getServiceRequests,
    getServiceRequestById,
    getProviderIncomingRequests,
    getProviderRequest,
    acceptProviderRequest,
    rejectProviderRequest,
    scheduleServiceRequest
};