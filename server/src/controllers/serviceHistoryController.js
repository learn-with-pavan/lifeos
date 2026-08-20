const serviceHistoryService = require("../services/serviceHistoryService");

const createServiceHistory = async (req, res, next) => {
    try {
        const serviceHistory =
            await serviceHistoryService.createServiceHistory(
                req.userId,
                req.body
            );

        res.status(201).json({
            success: true,
            message: "Service history created successfully",
            serviceHistory,
        });
    } catch (error) {
        next(error);
    }
};

const getServiceHistories = async (
    req,
    res,
    next
) => {
    try {
        const serviceHistories =
            await serviceHistoryService.getServiceHistories(
                req.userId
            );

        res.status(200).json({
            success: true,
            serviceHistories,
        });
    } catch (error) {
        next(error);
    }
};

const getServiceHistoryByAsset = async (
    req,
    res,
    next
) => {
    try {
        const serviceHistories =
            await serviceHistoryService.getServiceHistoryByAsset(
                req.userId,
                req.params.assetId
            );

        res.status(200).json({
            success: true,
            serviceHistories,
        });
    } catch (error) {
        next(error);
    }
};

const getServiceHistoryById = async (
    req,
    res,
    next
) => {
    try {
        const serviceHistory =
            await serviceHistoryService.getServiceHistoryById(
                req.userId,
                req.params.id
            );

        res.status(200).json({
            success: true,
            serviceHistory,
        });
    } catch (error) {
        next(error);
    }
};

const updateServiceHistory = async (
    req,
    res,
    next
) => {
    try {
        const serviceHistory =
            await serviceHistoryService.updateServiceHistory(
                req.userId,
                req.params.id,
                req.body
            );

        res.status(200).json({
            success: true,
            message: "Service history updated successfully",
            serviceHistory,
        });
    } catch (error) {
        next(error);
    }
};

const deleteServiceHistory = async (
    req,
    res,
    next
) => {
    try {
        await serviceHistoryService.deleteServiceHistory(
            req.userId,
            req.params.id
        );

        res.status(200).json({
            success: true,
            message: "Service history deleted successfully",
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createServiceHistory,
    getServiceHistories,
    getServiceHistoryByAsset,
    getServiceHistoryById,
    updateServiceHistory,
    deleteServiceHistory,
};