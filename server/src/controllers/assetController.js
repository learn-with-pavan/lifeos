const {
    createAsset,
    getAssets,
    getAssetById,
    updateAsset,
    deleteAsset,
} = require("../services/assetService");

const create = async (req, res, next) => {
    try {
        const {
            name,
            category,
            brand,
            model,
            purchaseDate,
            purchasePrice,
            notes,
            home
        } = req.body;

        if (!name || !category) {
            const error = new Error(
                "Asset name and category are required"
            );

            error.statusCode = 400;

            throw error;
        }

        const asset = await createAsset(req.userId, {
            name,
            category,
            brand,
            model,
            purchaseDate,
            purchasePrice,
            notes,
            home
        });

        res.status(201).json({
            success: true,
            message: "Asset created successfully",
            asset,
        });
    } catch (error) {
        next(error);
    }
};

const getAll = async (req, res, next) => {
    try {
        const assets = await getAssets(req.userId);

        res.status(200).json({
            success: true,
            assets,
        });
    } catch (error) {
        next(error);
    }
};

const getOne = async (req, res, next) => {
    try {
        const asset = await getAssetById(
            req.userId,
            req.params.id
        );

        res.status(200).json({
            success: true,
            asset,
        });
    } catch (error) {
        next(error);
    }
};

const update = async (req, res, next) => {
    try {
        const asset = await updateAsset(
            req.userId,
            req.params.id,
            req.body
        );

        res.status(200).json({
            success: true,
            asset,
        });
    } catch (error) {
        next(error);
    }
};

const remove = async (req, res, next) => {
    try {
        const asset = await deleteAsset(
            req.userId,
            req.params.id
        );

        res.status(200).json({
            success: true,
            asset,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    create,
    getAll,
    getOne,
    update,
    remove,
};