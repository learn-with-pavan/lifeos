const express = require("express");

const {
    create,
    getForServiceRequest,
    getProvider,
    getProviderRatingSummary,
} = require("../controllers/reviewController");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();
router.use(authMiddleware);

/*
 * Customer
 *
 * Submit review
 */
router.post(
    "/",
    authorizeRoles("CUSTOMER"),
    create
);


/*
 * Customer
 *
 * Check whether a review
 * already exists for a request.
 */
router.get(
    "/service-request/:serviceRequestId",
    authorizeRoles("CUSTOMER"),
    getForServiceRequest
);


/*
 * Public/provider profile
 *
 * Get provider reviews.
 */
router.get(
    "/provider/:serviceProviderId",
    getProvider
);


/*
 * Public/provider profile
 *
 * Get provider rating summary.
 */
router.get(
    "/provider/:serviceProviderId/rating",
    getProviderRatingSummary
);


module.exports = router;