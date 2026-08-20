const {
    getInsightsData,
} = require("../services/insightsService");

const getInsights = async (req, res) => {
    try {
        const data =
            await getInsightsData(
                req.userId
            );

        res.status(200).json({
            success: true,
            data,
        });

    } catch (error) {
        console.error(
            "Failed to load insights:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Unable to load insights.",
        });
    }
};

module.exports = {
    getInsights,
};