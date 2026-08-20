const {
    createWarrantyReminder,
    getWarrantyReminder,
    updateWarrantyReminder,
    deleteWarrantyReminder,
} = require("../services/reminderService");

const createReminder = async (req, res, next) => {
    try {
        const { remindBeforeDays } = req.body;

        const reminder =
            await createWarrantyReminder(
                req.userId,
                req.params.assetId,
                remindBeforeDays
            );

        res.status(201).json({
            success: true,
            message:
                "Warranty reminder created successfully",
            reminder,
        });
    } catch (error) {
        next(error);
    }
};

const getReminder = async (req, res, next) => {
    try {
        const reminder =
            await getWarrantyReminder(
                req.userId,
                req.params.assetId
            );

        res.status(200).json({
            success: true,
            reminder,
        });
    } catch (error) {
        next(error);
    }
};

const updateReminder = async (
    req,
    res,
    next
) => {
    try {
        const { remindBeforeDays } =
            req.body;

        const reminder =
            await updateWarrantyReminder(
                req.userId,
                req.params.assetId,
                remindBeforeDays
            );

        res.status(200).json({
            success: true,
            message:
                "Warranty reminder updated successfully",
            reminder,
        });
    } catch (error) {
        next(error);
    }
};

const deleteReminder = async (
    req,
    res,
    next
) => {
    try {
        await deleteWarrantyReminder(
            req.userId,
            req.params.assetId
        );

        res.status(200).json({
            success: true,
            message:
                "Warranty reminder deleted successfully",
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createReminder,
    getReminder,
    updateReminder,
    deleteReminder,
};