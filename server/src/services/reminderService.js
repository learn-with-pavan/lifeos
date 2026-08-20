const Reminder = require("../models/Reminder");
const Warranty = require("../models/Warranty");
const Asset = require("../models/Asset");

const validateRemindBeforeDays = (
    remindBeforeDays
) => {
    const days = Number(remindBeforeDays);

    if (
        !Number.isInteger(days) ||
        days < 0 ||
        days > 3650
    ) {
        const error = new Error(
            "remindBeforeDays must be an integer between 0 and 3650"
        );

        error.statusCode = 400;

        throw error;
    }

    return days;
};

const createWarrantyReminder = async (
    userId,
    assetId,
    remindBeforeDays
) => {
    const days =
        validateRemindBeforeDays(
            remindBeforeDays
        );

    const asset = await Asset.findOne({
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

    const warranty =
        await Warranty.findOne({
            asset: assetId,
            user: userId,
        });

    if (!warranty) {
        const error = new Error(
            "Warranty not found"
        );

        error.statusCode = 404;

        throw error;
    }

    const existingReminder =
        await Reminder.findOne({
            user: userId,
            asset: assetId,
            warranty: warranty._id,
            type: "WARRANTY_EXPIRY",
            status: {
                $ne: "CANCELLED",
            },
        });

    if (existingReminder) {
        const error = new Error(
            "Warranty reminder already exists"
        );

        error.statusCode = 409;

        throw error;
    }

    const reminderDate =
        new Date(warranty.endDate);

    reminderDate.setDate(
        reminderDate.getDate() - days
    );

    try {
        return await Reminder.create({
            user: userId,
            asset: assetId,
            warranty: warranty._id,
            type: "WARRANTY_EXPIRY",
            remindBeforeDays: days,
            reminderDate,
            status: "PENDING",
        });
    } catch (error) {
        if (error.code === 11000) {
            const duplicateError = new Error(
                "Warranty reminder already exists"
            );

            duplicateError.statusCode = 409;

            throw duplicateError;
        }

        throw error;
    }
};

const getWarrantyReminder = async (
    userId,
    assetId
) => {
    return Reminder.findOne({
        user: userId,
        asset: assetId,
        type: "WARRANTY_EXPIRY",
        status: {
            $ne: "CANCELLED",
        },
    }).populate(
        "warranty",
        "startDate endDate"
    );
};

const updateWarrantyReminder = async (
    userId,
    assetId,
    remindBeforeDays
) => {
    const days =
        validateRemindBeforeDays(
            remindBeforeDays
        );

    const reminder =
        await Reminder.findOne({
            user: userId,
            asset: assetId,
            type: "WARRANTY_EXPIRY",
            status: {
                $ne: "CANCELLED",
            },
        }).populate("warranty");

    if (!reminder) {
        const error = new Error(
            "Reminder not found"
        );

        error.statusCode = 404;

        throw error;
    }

    if (!reminder.warranty) {
        const error = new Error(
            "Warranty not found"
        );

        error.statusCode = 404;

        throw error;
    }

    const reminderDate =
        new Date(
            reminder.warranty.endDate
        );

    reminderDate.setDate(
        reminderDate.getDate() - days
    );

    reminder.remindBeforeDays = days;
    reminder.reminderDate = reminderDate;

    reminder.status = "PENDING";
    reminder.sentAt = null;

    await reminder.save();

    return reminder;
};

const deleteWarrantyReminder = async (
    userId,
    assetId
) => {
    const reminder =
        await Reminder.findOneAndDelete({
            user: userId,
            asset: assetId,
            type: "WARRANTY_EXPIRY",
        });

    if (!reminder) {
        const error = new Error(
            "Reminder not found"
        );

        error.statusCode = 404;

        throw error;
    }

    return reminder;
};

module.exports = {
    createWarrantyReminder,
    getWarrantyReminder,
    updateWarrantyReminder,
    deleteWarrantyReminder,
};