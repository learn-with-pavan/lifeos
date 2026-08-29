const express = require("express");

const authMiddleware =
    require("../middleware/authMiddleware");

const {
    uploadProfileImage,
} = require("../middleware/uploadMiddleware");

const {
    getProfile,
    updateProfile,
    updateProfileImageController,
} = require("../controllers/userController");


const router =
    express.Router();


router.use(
    authMiddleware
);


router.get(
    "/profile",
    getProfile
);


router.put(
    "/profile",
    updateProfile
);


router.put(
    "/profile/image",
    uploadProfileImage.single("profileImage"),
    updateProfileImageController
);


module.exports = router;