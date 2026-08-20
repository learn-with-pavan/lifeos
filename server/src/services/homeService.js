const Home = require("../models/Home");
const Asset = require("../models/Asset");
const Maintenance = require("../models/Maintenance");
const Document = require("../models/Document");
const ServiceHistory = require("../models/ServiceHistory");
const Reminder = require("../models/Reminder");


const createHome = async (userId, homeData) => {
    return Home.create({
        user: userId,
        ...homeData,
    });
};

const getHomes = async (userId) => {
    return Home.find({
        user: userId,
    }).sort({
        createdAt: -1,
    });
};

const getHomeById = async (userId, homeId) => {
    const home = await Home.findOne({
        _id: homeId,
        user: userId,
    });

    if (!home) {
        const error = new Error("Home not found");
        error.statusCode = 404;
        throw error;
    }

    return home;
};

const updateHome = async (
    userId,
    homeId,
    homeData
) => {
    const home = await Home.findOneAndUpdate(
        {
            _id: homeId,
            user: userId,
        },
        homeData,
        {
            returnDocument: "after",
            runValidators: true,
        }
    );

    if (!home) {
        const error = new Error("Home not found");
        error.statusCode = 404;
        throw error;
    }

    return home;
};

const deleteHome = async (
    userId,
    homeId
) => {
    const home = await Home.findOneAndDelete({
        _id: homeId,
        user: userId,
    });

    if (!home) {
        const error = new Error("Home not found");
        error.statusCode = 404;
        throw error;
    }

    return home;
};

const getHomeDetailsByHome = async (userId, homeId) => {
    const home = await Home.findOne({
        _id: homeId,
        user: userId,
    });

    if (!home) {
        const error = new Error("Home not found");
        error.statusCode = 404;
        throw error;
    }

    const assets = await Asset.find({
        user: userId,
        home: homeId,
    }).sort({
        createdAt: -1,
    });

    const assetIds = assets.map(
        (asset) => asset._id
    );

    const [
        maintenance,
        documents,
        serviceHistory,
        reminders,
    ] = await Promise.all([
        Maintenance.find({
            user: userId,
            asset: { $in: assetIds },
        })
            .populate("asset", "name")
            .sort({ dueDate: 1 })
            .limit(5),

        Document.find({
            user: userId,
            asset: { $in: assetIds },
        })
            .populate("asset", "name")
            .sort({ createdAt: -1 })
            .limit(5),

        ServiceHistory.find({
            user: userId,
            asset: { $in: assetIds },
        })
            .populate("asset", "name")
            .sort({ serviceDate: -1 })
            .limit(5),

        Reminder.find({
            user: userId,
            asset: { $in: assetIds },
            status: "PENDING",
        })
            .populate("asset", "name")
            .sort({ reminderDate: 1 })
            .limit(5),
    ]);

    return {
        home,

        assets,

        maintenance,

        documents,

        serviceHistory,

        reminders,

        summary: {
            assets: assets.length,
            maintenance: maintenance.length,
            documents: documents.length,
            serviceHistory: serviceHistory.length,
            reminders: reminders.length,
        },
    };
};

module.exports = {
    createHome,
    getHomes,
    getHomeById,
    updateHome,
    deleteHome,
    getHomeDetailsByHome,
};