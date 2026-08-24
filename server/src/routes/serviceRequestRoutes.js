const express = require("express");

const {
    create,
    getAll,
    getById,
    cancelServiceRequest,
    getProviderIncomingRequests,
    getProviderRequest,
    acceptProviderRequest,
    rejectProviderRequest,
    scheduleServiceRequestController,
} = require("../controllers/serviceRequestController");

const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.post(
    "/",
    authorizeRoles("CUSTOMER"),
    create
);


router.get(
    "/",
    authorizeRoles("CUSTOMER"),
    getAll
);


router.get(
    "/:id",
    authorizeRoles("CUSTOMER"),
    getById
);

router.patch(
    "/:requestId/cancel",
    authorizeRoles("CUSTOMER"),
    cancelServiceRequest
);

router.get(
    "/provider/incoming",
    authorizeRoles("PROVIDER"),
    getProviderIncomingRequests
);

router.get(
    "/provider/:requestId",
    authorizeRoles("PROVIDER"),
    getProviderRequest
);

router.patch(
    "/provider/:requestId/accept",
    authorizeRoles("PROVIDER"),
    acceptProviderRequest
);

router.patch(
    "/provider/:requestId/reject",
    authorizeRoles("PROVIDER"),
    rejectProviderRequest
);


router.patch(
    "/:requestId/schedule",
    authorizeRoles("PROVIDER"),
    scheduleServiceRequestController
);

module.exports = router;