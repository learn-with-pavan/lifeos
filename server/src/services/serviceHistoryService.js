const ServiceHistory = require("../models/ServiceHistory");
const Asset = require("../models/Asset");
const {
    processEvent,
} = require("./automationService");


const createServiceHistory = async (
    userId,
    serviceData
) => {

    // 1. Validate asset belongs to user
    const asset = await Asset.findOne({
        _id: serviceData.asset,
        user: userId,
    });

    if (!asset) {
        const error = new Error(
            "Asset not found"
        );

        error.statusCode = 404;

        throw error;
    }


    // 2. Create service history
    const serviceHistory =
        await ServiceHistory.create({
            user: userId,
            ...serviceData,
        });


    // 3. Trigger Automation Engine
    try {

        await processEvent(
            "SERVICE_COMPLETED",
            {
                userId,

                assetId:
                    asset._id,

                assetCategory:
                    asset.category,

                serviceHistoryId:
                    serviceHistory._id,

                serviceType:
                    serviceHistory.serviceType,

                provider:
                    serviceHistory.provider,

                cost:
                    serviceHistory.cost,

                serviceDate:
                    serviceHistory.serviceDate,

                message:
                    `${serviceHistory.serviceType} completed for ${asset.name}.`,
            }
        );

    } catch (error) {

        /*
         * Service history should still remain
         * successfully created even if an
         * automation action fails.
         */
        console.error(
            "Service completed automation failed:",
            error
        );
    }


    // 4. Return created service history
    return serviceHistory;
};

const getServiceHistories = async (
    userId
) => {
    return ServiceHistory.find({
        user: userId,
    })
        .populate(
            "asset",
            "name"
        )
        .sort({
            serviceDate: -1,
        });
};

const getServiceHistoryByAsset =
    async (
        userId,
        assetId
    ) => {
        const asset =
            await Asset.findOne({
                _id: assetId,
                user: userId,
            });

        if (!asset) {
            const error = new Error(
                "Asset not found"
            );

            error.statusCode = 404;

            throw error;
        }

        return ServiceHistory.find({
            user: userId,
            asset: assetId,
        })
            .populate(
                "asset",
                "name"
            )
            .sort({
                serviceDate: -1,
            });
    };

const getServiceHistoryById =
    async (
        userId,
        serviceHistoryId
    ) => {
        const serviceHistory =
            await ServiceHistory.findOne({
                _id: serviceHistoryId,
                user: userId,
            }).populate(
                "asset",
                "name"
            );

        if (!serviceHistory) {
            const error = new Error(
                "Service history not found"
            );

            error.statusCode = 404;

            throw error;
        }

        return serviceHistory;
    };

const updateServiceHistory =
    async (
        userId,
        serviceHistoryId,
        serviceData
    ) => {
        if (serviceData.asset) {
            const asset =
                await Asset.findOne({
                    _id: serviceData.asset,
                    user: userId,
                });

            if (!asset) {
                const error = new Error(
                    "Asset not found"
                );

                error.statusCode = 404;

                throw error;
            }
        }

        const serviceHistory =
            await ServiceHistory.findOneAndUpdate(
                {
                    _id: serviceHistoryId,
                    user: userId,
                },
                serviceData,
                {
                    returnDocument: "after",
                    runValidators: true,
                }
            ).populate(
                "asset",
                "name"
            );

        if (!serviceHistory) {
            const error = new Error(
                "Service history not found"
            );

            error.statusCode = 404;

            throw error;
        }

        return serviceHistory;
    };

const deleteServiceHistory =
    async (
        userId,
        serviceHistoryId
    ) => {
        const serviceHistory =
            await ServiceHistory.findOneAndDelete(
                {
                    _id: serviceHistoryId,
                    user: userId,
                }
            );

        if (!serviceHistory) {
            const error = new Error(
                "Service history not found"
            );

            error.statusCode = 404;

            throw error;
        }

        return serviceHistory;
    };

module.exports = {
    createServiceHistory,
    getServiceHistories,
    getServiceHistoryByAsset,
    getServiceHistoryById,
    updateServiceHistory,
    deleteServiceHistory,
};