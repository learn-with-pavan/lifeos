const Warranty = require("../models/Warranty");
const Asset = require("../models/Asset");

const createWarranty = async (userId, assetId, warrantyData) => {
    const asset = await Asset.findOne({
        _id: assetId,
        user: userId,
    });

    if (!asset) {
        const error = new Error("Asset not found");
        error.statusCode = 404;
        throw error;
    }

    const existingWarranty = await Warranty.findOne({
        asset: assetId,
        user: userId,
    });

    if (existingWarranty) {
        const error = new Error(
            "Warranty already exists for this asset"
        );

        error.statusCode = 409;

        throw error;
    }

    return Warranty.create({
        user: userId,
        asset: assetId,
        ...warrantyData,
    });
};

const getWarrantyByAsset = async (userId, assetId) => {
    const asset = await Asset.findOne({
        _id: assetId,
        user: userId,
    });

    if (!asset) {
        const error = new Error("Asset not found");
        error.statusCode = 404;
        throw error;
    }

    return Warranty.findOne({
        asset: assetId,
        user: userId,
    });
};

const updateWarranty = async (
    userId,
    assetId,
    warrantyData
) => {
    const warranty = await Warranty.findOneAndUpdate(
        {
            asset: assetId,
            user: userId,
        },
        warrantyData,
        {
            returnDocument: "after",
            runValidators: true,
        }
    );

    if (!warranty) {
        const error = new Error("Warranty not found");
        error.statusCode = 404;
        throw error;
    }

    return warranty;
};

const deleteWarranty = async (
    userId,
    assetId
) => {
    const warranty = await Warranty.findOneAndDelete({
        asset: assetId,
        user: userId,
    });

    if (!warranty) {
        const error = new Error("Warranty not found");
        error.statusCode = 404;
        throw error;
    }

    return warranty;
};

module.exports = {
    createWarranty,
    getWarrantyByAsset,
    updateWarranty,
    deleteWarranty,
};