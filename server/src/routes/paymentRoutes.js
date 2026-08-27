const express = require("express");
const {
    getPayment,
    getPayments,
    processPayment,
} = require("../controllers/paymentController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);


router.get(
    "/",
    getPayments
);

router.get(
    "/service-request/:serviceRequestId",
    getPayment
);

router.post(
    "/:paymentId/process",
    processPayment
);

module.exports = router;