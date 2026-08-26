const express = require("express");
const {
    getPayment,
    getPayments,
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

module.exports = router;