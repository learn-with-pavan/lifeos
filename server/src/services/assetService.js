const Asset = require("../models/Asset");
const Home = require("../models/Home");

const createAsset = async (userId, assetData) => {
    const { home, ...data } = assetData;

    const homeRecord = await Home.findOne({
        _id: home,
        user: userId,
    });

    if (!homeRecord) {
        const error = new Error("Home not found");
        error.statusCode = 404;
        throw error;
    }

    return Asset.create({
        user: userId,
        home: home,
        ...data,
    });
};

const getAssets = async (userId) => {
    return Asset.find({
        user: userId,
    })
        .populate("home", "name type address")
        .sort({ createdAt: -1 });
};

const getAssetById = async (userId, assetId) => {
    const asset = await Asset.findOne({
        _id: assetId,
        user: userId,
    }).populate(
        "home",
        "name type address purchaseDate"
    );

    if (!asset) {
        const error = new Error("Asset not found");
        error.statusCode = 404;
        throw error;
    }

    return asset;
};

const updateAsset = async (
    userId,
    assetId,
    assetData
) => {
    const { home, ...data } = assetData;

    const asset = await Asset.findOne({
        _id: assetId,
        user: userId,
    });

    if (!asset) {
        const error = new Error("Asset not found");
        error.statusCode = 404;
        throw error;
    }

    if (home) {
        const homeRecord = await Home.findOne({
            _id: home,
            user: userId,
        });

        if (!homeRecord) {
            const error = new Error("Home not found");
            error.statusCode = 404;
            throw error;
        }

        asset.home = home;
    }

    Object.assign(asset, data);

    await asset.save();

    await asset.populate(
        "home",
        "name type address"
    );

    return asset;
};

const deleteAsset = async (
    userId,
    assetId
) => {
    const asset = await Asset.findOneAndDelete({
        _id: assetId,
        user: userId,
    });

    if (!asset) {
        const error = new Error("Asset not found");
        error.statusCode = 404;
        throw error;
    }

    return asset;
};

module.exports = {
    createAsset,
    getAssets,
    getAssetById,
    updateAsset,
    deleteAsset,
};