const Maintenance = require("../models/Maintenance");
const Asset = require("../models/Asset");

const createMaintenance = async (
    userId,
    assetId,
    maintenanceData
) => {
    const asset = await Asset.findOne({
        _id: assetId,
        user: userId,
    });

    if (!asset) {
        const error = new Error("Asset not found");
        error.statusCode = 404;
        throw error;
    }

    return Maintenance.create({
        user: userId,
        asset: assetId,
        ...maintenanceData,
    });
};

const getMaintenanceByAsset = async (
    userId,
    assetId
) => {
    const asset = await Asset.findOne({
        _id: assetId,
        user: userId,
    });

    if (!asset) {
        const error = new Error("Asset not found");
        error.statusCode = 404;
        throw error;
    }

    return Maintenance.find({
        user: userId,
        asset: assetId,
    }).sort({
        dueDate: 1,
    });
};

const getAllMaintenance = async (userId) => {
    return Maintenance.find({
        user: userId,
    })
        .populate(
            "asset",
            "name category brand model"
        )
        .sort({
            dueDate: 1,
        });
};

const getMaintenanceById = async (
    userId,
    maintenanceId
) => {
    return Maintenance.findOne({
        _id: maintenanceId,
        user: userId,
    }).populate(
        "asset",
        "name category brand model"
    );
};

const updateMaintenance = async (
    userId,
    maintenanceId,
    maintenanceData
) => {
    const maintenance =
        await Maintenance.findOneAndUpdate(
            {
                _id: maintenanceId,
                user: userId,
            },
            maintenanceData,
            {
                returnDocument: "after",
                runValidators: true,
            }
        ).populate(
            "asset",
            "name category brand model"
        );

    if (!maintenance) {
        const error = new Error(
            "Maintenance not found"
        );

        error.statusCode = 404;

        throw error;
    }

    return maintenance;
};

const deleteMaintenance = async (
    userId,
    maintenanceId
) => {
    const maintenance =
        await Maintenance.findOneAndDelete({
            _id: maintenanceId,
            user: userId,
        });

    if (!maintenance) {
        const error = new Error(
            "Maintenance not found"
        );

        error.statusCode = 404;

        throw error;
    }

    return maintenance;
};

module.exports = {
    createMaintenance,
    getMaintenanceByAsset,
    getAllMaintenance,
    getMaintenanceById,
    updateMaintenance,
    deleteMaintenance,
};