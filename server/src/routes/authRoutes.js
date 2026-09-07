const express = require("express");

const {
  register,
  login,
  registerProvider,
  verifyRegistration,
  sendRegistrationOtp,
  sendLoginOtp,
  verifyLoginOtp,
} = require("../controllers/authController");

const authMiddleware =
  require("../middleware/authMiddleware");

const router =
  express.Router();


router.post(
  "/register",
  register
);

router.post(
  "/provider/register",
  registerProvider
);

router.post(
  "/register/verify-otp",
  verifyRegistration
);

router.post(
  "/register/send-otp",
  sendRegistrationOtp
);


router.post(
  "/login",
  login
);

router.post(
  "/login/send-otp",
  sendLoginOtp
);

router.post(
  "/login/verify-otp",
  verifyLoginOtp
);


router.get(
  "/me",
  authMiddleware,
  (req, res) => {

    res.json({

      success: true,

      message:
        "You are authenticated",

      userId:
        req.userId,
    });
  }
);


module.exports = router;