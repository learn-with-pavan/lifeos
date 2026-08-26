const ServiceRequest = require("../models/ServiceRequest");
const {
    createServiceRequest,
    getServiceRequests,
    getServiceRequestById,
    getProviderIncomingRequests: loadProviderIncomingRequests,
    getProviderRequest: loadProviderRequest,
    acceptProviderRequest: acceptProviderRequestService,
    rejectProviderRequest: rejectProviderRequestService,
    scheduleServiceRequest,
    rescheduleServiceRequest,
} = require("../services/serviceRequestService");


const create = async (req, res) => {
    try {

        const serviceRequest =
            await createServiceRequest(
                req.userId,
                req.body
            );


        res.status(201).json({
            success: true,
            message:
                "Service request created successfully",
            request: serviceRequest,
        });

    } catch (error) {

        console.error(
            "Create service request error:",
            error
        );

        res.status(
            error.statusCode || 500
        ).json({
            success: false,
            message:
                error.message ||
                "Failed to create service request",
        });
    }
};


const getAll = async (
    req,
    res
) => {

    try {

        const requests =
            await getServiceRequests(
                req.userId
            );


        res.status(200).json({
            success: true,
            requests,
        });

    } catch (error) {

        console.error(
            "Get service requests error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to fetch service requests",
        });
    }
};


const getById = async (
    req,
    res
) => {

    try {

        const request =
            await getServiceRequestById(
                req.userId,
                req.params.id
            );


        res.status(200).json({
            success: true,
            request,
        });

    } catch (error) {

        console.error(
            "Get service request error:",
            error
        );

        res.status(
            error.statusCode || 500
        ).json({
            success: false,
            message:
                error.message ||
                "Failed to fetch service request",
        });
    }
};

const cancelServiceRequest = async (req, res) => {

    try {

        const {
            requestId,
        } = req.params;


        const request =
            await ServiceRequest.findOne({
                _id: requestId,
                user: req.userId,
            });


        if (!request) {

            return res.status(404).json({
                message:
                    "Service request not found.",
            });

        }

        const cancellableStatuses = [
            "PENDING",
            "ACCEPTED",
            "SCHEDULED",
        ];

        if (
            !cancellableStatuses.includes(
                request.status
            )
        ) {

            return res.status(400).json({
                message:
                    `Service request cannot be cancelled when it is ${request.status.toLowerCase()}.`,
            });
        }

        request.status =
            "CANCELLED";


        await request.save();

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
                "SERVICE_REQUEST_CANCELLED",

            request:
                populatedRequest,

            providerMessage:
                "The customer cancelled this service request.",
        });


        return res.status(200).json({

            message:
                "Service request cancelled successfully.",

            request,

        });

    } catch (error) {

        console.error(
            "Cancel service request error:",
            error
        );


        return res.status(500).json({
            message:
                "Unable to cancel service request.",
        });

    }
};

// Provider Incoming Requests
const getProviderIncomingRequests = async (req, res) => {

    try {

        const result =
            await loadProviderIncomingRequests(
                req.userId
            );

        return res.status(200).json(result);

    } catch (error) {

        console.error(
            "Get provider incoming requests error:",
            error
        );


        return res.status(error.statusCode || 500).json({
            message:
                error.statusCode
                    ? error.message
                    : "Unable to load incoming service requests.",
        });

    }
};

const getProviderRequest = async (req, res) => {
    try {

        const request = await loadProviderRequest(
            req.userId,
            req.params.requestId
        );

        return res.status(200).json({
            request,
        });

    } catch (error) {

        console.error(
            "Get provider request error:",
            error
        );

        return res.status(error.statusCode || 500).json({
            message: error.statusCode
                ? error.message
                : "Unable to load service request.",
        });
    }
};

const acceptProviderRequest = async (req, res) => {
    try {

        const request = await acceptProviderRequestService(
            req.userId,
            req.params.requestId
        );

        return res.status(200).json({
            message: "Service request accepted successfully.",
            request,
        });

    } catch (error) {

        console.error(
            "Accept provider request error:",
            error
        );

        return res.status(error.statusCode || 500).json({
            message: error.statusCode
                ? error.message
                : "Unable to accept service request.",
        });
    }
};

const rejectProviderRequest = async (req, res) => {
    try {

        const request = await rejectProviderRequestService(
            req.userId,
            req.params.requestId
        );

        return res.status(200).json({
            message: "Service request rejected successfully.",
            request,
        });

    } catch (error) {

        console.error(
            "Reject provider request error:",
            error
        );

        return res.status(error.statusCode || 500).json({
            message: error.statusCode
                ? error.message
                : "Unable to reject service request.",
        });
    }
};

// Schedling service
const scheduleServiceRequestController = async (req, res) => {

    try {

        const request =
            await scheduleServiceRequest(
                req.params.requestId,
                req.userId,
                req.body
            );


        return res.status(200).json({

            message:
                "Service request scheduled successfully.",

            request,

        });

    } catch (error) {

        return res.status(
            error.statusCode || 500
        ).json({

            message:
                error.statusCode
                    ? error.message
                    : "Unable to schedule service request.",

        });

    }
};

// Reschedule service
const rescheduleServiceRequestController = async (req, res) => {

    try {

        const request =
            await rescheduleServiceRequest(
                req.params.requestId,
                req.userId,
                req.body
            );


        return res.status(200).json({

            message:
                "Service appointment rescheduled successfully.",

            request,

        });

    } catch (error) {

        console.error(
            "Reschedule service request error:",
            error
        );


        return res.status(
            error.statusCode || 500
        ).json({

            message:
                error.statusCode
                    ? error.message
                    : "Unable to reschedule service appointment.",

        });

    }
};
module.exports = {
    create,
    getAll,
    getById,
    cancelServiceRequest,
    getProviderIncomingRequests,
    getProviderRequest,
    acceptProviderRequest,
    rejectProviderRequest,
    scheduleServiceRequestController,
    rescheduleServiceRequestController
};