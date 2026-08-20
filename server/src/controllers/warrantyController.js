const {
    createWarranty,
    getWarrantyByAsset,
    deleteWarranty,
    updateWarranty,
} = require("../services/warrantyService");

const create = async (req, res, next) => {
    try {
        const warranty = await createWarranty(
            req.userId,
            req.params.assetId,
            req.body
        );

        res.status(201).json({
            success: true,
            message: "Warranty created successfully",
            warranty,
        });
    } catch (error) {
        next(error);
    }
};

const getByAsset = async (req, res, next) => {
    try {
        const warranty = await getWarrantyByAsset(
            req.userId,
            req.params.assetId
        );

        res.status(200).json({
            success: true,
            warranty,
        });
    } catch (error) {
        next(error);
    }
};


const update = async (req, res, next) => {
    try {
        const warranty = await updateWarranty(
            req.userId,
            req.params.assetId,
            req.body
        );

        res.status(200).json({
            success: true,
            message: "Warranty updated successfully",
            warranty,
        });
    } catch (error) {
        next(error);
    }
};

const remove = async (req, res, next) => {
    try {
        await deleteWarranty(
            req.userId,
            req.params.assetId
        );

        res.status(200).json({
            success: true,
            message: "Warranty deleted successfully",
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    create,
    getByAsset,
    update,
    remove
};