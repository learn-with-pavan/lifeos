const {
    getDashboardData,
} = require("../services/dashboardService");

const getDashboard = async (req, res, next) => {
    try {
        const data = await getDashboardData(
            req.userId
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
    getDashboard,
};