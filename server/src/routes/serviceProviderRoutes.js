const express = require("express");

const {
    createProvider,
    getMyProvider,
    updateProvider,
    updateAvailability,
    discoverProviders,
    startProviderServices,
    completeProviderServices,
    getProviderDashboard,
    getProviderScheduleController,
    updateProviderSettingsController,
    updateLocation,
} = require("../controllers/serviceProviderController");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(authMiddleware);
/*
 * Create provider profile
 *
 * POST /api/service-providers
 */
router.post(
    "/",
    authorizeRoles("PROVIDER"),
    createProvider
);


/*
 * Get current provider profile
 *
 * GET /api/service-providers/me
 */
router.get(
    "/me",
    authorizeRoles("PROVIDER"),
    getMyProvider
);


/*
 * Update provider profile
 *
 * PUT /api/service-providers/me
 */
router.put(
    "/me",
    authorizeRoles("PROVIDER"),
    updateProvider
);


/*
 * Update availability
 *
 * PATCH /api/service-providers/me/availability
 */
router.patch(
    "/me/availability",
    authorizeRoles("PROVIDER"),
    updateAvailability
);


router.get(
    "/for-asset/:assetId",
    authorizeRoles("CUSTOMER"),
    discoverProviders
);

router.post(
    "/provider/:requestId/start",
    authorizeRoles("PROVIDER"),
    startProviderServices
);


router.post(
    "/provider/:requestId/complete",
    authorizeRoles("PROVIDER"),
    completeProviderServices
);

router.get(
    "/dashboard",
    authorizeRoles("PROVIDER"),
    getProviderDashboard
);

router.get(
    "/schedule",
    authorizeRoles("PROVIDER"),
    getProviderScheduleController
);

router.patch(
    "/me/settings",
    authorizeRoles("PROVIDER"),
    updateProviderSettingsController
);

router.patch(
    "/me/location",
    authorizeRoles("PROVIDER"),
    updateLocation
);

module.exports = router;