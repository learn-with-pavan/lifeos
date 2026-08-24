const express = require("express");

const { register, login, registerProvider } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);

router.post("/provider/register", registerProvider);

router.post("/login", login)

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