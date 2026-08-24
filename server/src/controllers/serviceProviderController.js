const { findProvidersForAsset } = require("../services/providerDiscoveryService");
const {
    createServiceProvider,
    getMyServiceProvider,
    updateServiceProvider,
    updateProviderAvailability,
    startProviderService,
    completeProviderService,
    getProviderByUserId,
    getProviderDashboardData,
    getProviderSchedule,
    updateProviderLocation,
} = require("../services/serviceProviderService");


/*
 * Create provider profile
 *
 * POST /api/service-providers
 */
const createProvider = async (req, res, next) => {

    try {

        const provider =
            await createServiceProvider(
                req.userId,
                req.body
            );

        return res.status(201).json({
            success: true,
            message:
                "Service provider profile created successfully.",
            data: provider,
        });

    } catch (error) {

        next(error);
    }
};


/*
 * Get current user's provider profile
 *
 * GET /api/service-providers/me
 */
const getMyProvider = async (req, res, next) => {

    try {

        const provider =
            await getMyServiceProvider(
                req.userId
            );

        return res.status(200).json({
            success: true,
            data: provider,
        });

    } catch (error) {

        next(error);
    }
};


/*
 * Update current user's provider profile
 *
 * PUT /api/service-providers/me
 */
const updateProvider = async (req, res, next) => {

    try {

        const provider =
            await updateServiceProvider(
                req.userId,
                req.body
            );

        return res.status(200).json({
            success: true,
            message:
                "Service provider profile updated successfully.",
            data: provider,
        });

    } catch (error) {

        next(error);
    }
};


/*
 * Update provider availability
 *
 * PATCH /api/service-providers/me/availability
 */
const updateAvailability = async (req, res, next) => {

    try {

        const provider =
            await updateProviderAvailability(
                req.userId,
                req.body.availability
            );

        return res.status(200).json({
            success: true,
            message:
                "Provider availability updated successfully.",
            data: {
                availability:
                    provider.availability,
            },
        });

    } catch (error) {

        next(error);
    }
};

const discoverProviders = async (req, res, next) => {

    try {

        const {
            longitude,
            latitude,
        } = req.query;


        if (
            longitude === undefined ||
            latitude === undefined
        ) {

            const error = new Error(
                "Customer latitude and longitude are required"
            );

            error.statusCode = 400;

            throw error;
        }


        const result =
            await findProvidersForAsset(
                req.userId,
                req.params.assetId,
                Number(longitude),
                Number(latitude)
            );


        return res.status(200).json({
            success: true,
            data: result,
        });

    } catch (error) {

        next(error);
    }
};

const startProviderServices = async (req, res) => {

    try {

        const provider =
            await getProviderByUserId(
                req.userId
            );

        if (!provider) {

            return res.status(404).json({
                message:
                    "Service provider profile not found.",
            });
        }


        const request =
            await startProviderService(
                req.params.requestId,
                provider._id
            );


        if (!request) {

            return res.status(400).json({
                message:
                    "Service cannot be started from the current status.",
            });
        }


        return res.status(200).json({
            message:
                "Service started successfully.",
            request,
        });

    } catch (error) {
        return res.status(500).json({
            message:
                "Unable to start service.",
        });
    }
};

const completeProviderServices = async (req, res) => {

    try {

        const provider =
            await getProviderByUserId(
                req.userId
            );


        if (!provider) {

            return res.status(404).json({
                message:
                    "Service provider profile not found.",
            });
        }


        const completionData = {
            completionNotes:
                req.body?.completionNotes,

            serviceCost:
                req.body?.serviceCost,

            partsUsed:
                req.body?.partsUsed,
        };


        const request =
            await completeProviderService(
                req.params.requestId,
                provider._id,
                completionData
            );


        return res.status(200).json({
            success: true,

            message:
                "Service completed successfully.",

            request,
        });

    } catch (error) {

        return res.status(
            error.statusCode || 500
        ).json({
            success: false,

            message:
                error.statusCode
                    ? error.message
                    : "Unable to complete service.",
        });
    }
};

const getProviderDashboard = async (req, res) => {

    try {

        const provider =
            await getProviderByUserId(
                req.userId
            );


        if (!provider) {

            return res.status(404).json({
                success: false,
                message:
                    "Service provider profile not found.",
            });
        }


        const dashboard =
            await getProviderDashboardData(
                provider._id
            );


        return res.status(200).json({

            success: true,

            dashboard,

        });

    } catch (error) {

        console.error(
            "Provider dashboard error:",
            error
        );


        return res.status(
            error.statusCode || 500
        ).json({

            success: false,

            message:
                error.statusCode
                    ? error.message
                    : "Unable to load provider dashboard.",

        });
    }
};

const getProviderScheduleController = async (req, res) => {

    try {

        const provider =
            await getProviderByUserId(
                req.userId
            );


        if (!provider) {

            return res.status(404).json({
                success: false,
                message:
                    "Service provider profile not found.",
            });
        }


        const {
            startDate,
            endDate,
        } = req.query;


        const schedule =
            await getProviderSchedule(
                provider._id,
                startDate,
                endDate
            );


        return res.status(200).json({

            success: true,

            schedule,

        });

    } catch (error) {

        console.error(
            "Provider schedule error:",
            error
        );


        return res.status(
            error.statusCode || 500
        ).json({

            success: false,

            message:
                error.statusCode
                    ? error.message
                    : "Unable to load provider schedule.",

        });
    }
};

const updateProviderSettingsController = async (req, res, next) => {

    try {

        const provider =
            await updateProviderSettings(
                req.userId,
                req.body
            );

        return res.status(200).json({
            success: true,
            message:
                "Provider settings updated successfully.",
            data: provider,
        });

    } catch (error) {

        next(error);
    }
};

const updateLocation = async (req, res, next) => {

    try {

        const {
            latitude,
            longitude,
        } = req.body;

        if (
            latitude === undefined ||
            longitude === undefined
        ) {

            const error =
                new Error(
                    "Latitude and longitude are required."
                );

            error.statusCode = 400;

            throw error;
        }

        const latitudeNumber =
            Number(latitude);

        const longitudeNumber =
            Number(longitude);

        if (
            !Number.isFinite(latitudeNumber) ||
            !Number.isFinite(longitudeNumber)
        ) {

            const error =
                new Error(
                    "Invalid latitude or longitude."
                );

            error.statusCode = 400;

            throw error;
        }

        if (
            latitudeNumber < -90 ||
            latitudeNumber > 90 ||
            longitudeNumber < -180 ||
            longitudeNumber > 180
        ) {

            const error =
                new Error(
                    "Latitude or longitude is outside valid range."
                );

            error.statusCode = 400;

            throw error;
        }

        const provider =
            await updateProviderLocation(
                req.userId,
                latitudeNumber,
                longitudeNumber
            );

        return res.status(200).json({

            success: true,

            message:
                "Provider location updated successfully.",

            data: provider,

        });

    } catch (error) {

        next(error);
    }
};

module.exports = {
    createProvider,
    getMyProvider,
    updateProvider,
    updateAvailability,
    discoverProviders,
    startProviderServices,
    completeProviderServices,
    getProviderDashboard,
    getProviderScheduleController,
    updateProviderSettingsController,
    updateLocation
};