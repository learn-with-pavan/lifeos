const {
    createHome,
    getHomes,
    getHomeById,
    updateHome,
    deleteHome,
    getHomeDetailsByHome,
} = require("../services/homeService");

const create = async (req, res, next) => {
    try {
        const home = await createHome(
            req.userId,
            req.body
        );

        res.status(201).json({
            success: true,
            message: "Home created successfully",
            home,
        });
    } catch (error) {
        next(error);
    }
};

const getAll = async (req, res, next) => {
    try {
        const homes = await getHomes(
            req.userId
        );

        res.status(200).json({
            success: true,
            homes,
        });
    } catch (error) {
        next(error);
    }
};

const getOne = async (req, res, next) => {
    try {
        const home = await getHomeById(
            req.userId,
            req.params.homeId
        );

        res.status(200).json({
            success: true,
            home,
        });
    } catch (error) {
        next(error);
    }
};

const update = async (req, res, next) => {
    try {
        const home = await updateHome(
            req.userId,
            req.params.homeId,
            req.body
        );

        res.status(200).json({
            success: true,
            message: "Home updated successfully",
            home,
        });
    } catch (error) {
        next(error);
    }
};

const remove = async (req, res, next) => {
    try {
        await deleteHome(
            req.userId,
            req.params.homeId
        );

        res.status(200).json({
            success: true,
            message: "Home deleted successfully",
        });
    } catch (error) {
        next(error);
    }
};

const getHomeDetails = async (
    req,
    res,
    next
) => {
    try {
        const data = await getHomeDetailsByHome(
            req.userId,
            req.params.homeId
        );

        res.status(200).json({
            success: true,
            data,
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
    getHomeDetails
};