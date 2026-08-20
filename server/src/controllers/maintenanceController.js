const {
    createMaintenance,
    getMaintenanceByAsset,
    getAllMaintenance,
    getMaintenanceById,
    updateMaintenance,
    deleteMaintenance,
} = require("../services/maintenanceService");

const create = async (req, res, next) => {
    try {
        const maintenance =
            await createMaintenance(
                req.userId,
                req.params.assetId,
                req.body
            );

        res.status(201).json({
            success: true,
            message:
                "Maintenance created successfully",
            maintenance,
        });
    } catch (error) {
        next(error);
    }
};

const getByAsset = async (
    req,
    res,
    next
) => {
    try {
        const maintenance =
            await getMaintenanceByAsset(
                req.userId,
                req.params.assetId
            );

        res.status(200).json({
            success: true,
            maintenance,
        });
    } catch (error) {
        next(error);
    }
};

const getAll = async (
    req,
    res,
    next
) => {
    try {
        const maintenance =
            await getAllMaintenance(
                req.userId
            );

        res.status(200).json({
            success: true,
            maintenance,
        });
    } catch (error) {
        next(error);
    }
};

const getById = async (
    req,
    res,
    next
) => {
    try {
        const maintenance =
            await getMaintenanceById(
                req.userId,
                req.params.maintenanceId
            );

        if (!maintenance) {
            const error = new Error(
                "Maintenance not found"
            );

            error.statusCode = 404;

            throw error;
        }

        res.status(200).json({
            success: true,
            maintenance,
        });
    } catch (error) {
        next(error);
    }
};

const update = async (
    req,
    res,
    next
) => {
    try {
        const maintenance =
            await updateMaintenance(
                req.userId,
                req.params.maintenanceId,
                req.body
            );

        res.status(200).json({
            success: true,
            message:
                "Maintenance updated successfully",
            maintenance,
        });
    } catch (error) {
        next(error);
    }
};

const remove = async (
    req,
    res,
    next
) => {
    try {
        await deleteMaintenance(
            req.userId,
            req.params.maintenanceId
        );

        res.status(200).json({
            success: true,
            message:
                "Maintenance deleted successfully",
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    create,
    getByAsset,
    getAll,
    getById,
    update,
    remove,
};