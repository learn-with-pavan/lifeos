const express = require("express");

const {
    getInsights,
} = require("../controllers/insightsController");

const authMiddleware = require(
    "../middleware/authMiddleware"
);

const router = express.Router();

router.get(
    "/",
    authMiddleware,
    getInsights
);

module.exports = router;