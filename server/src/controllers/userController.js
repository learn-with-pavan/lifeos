const {
    getUserProfile,
    updateUserProfile,
    updateProfileImage,
} = require("../services/userService");


const getProfile = async (
    req,
    res
) => {

    try {

        const user =
            await getUserProfile(
                req.userId
            );

        res.status(200).json({
            success: true,
            user,
        });

    } catch (error) {

        res.status(
            error.statusCode || 500
        ).json({
            message:
                error.message ||
                "Failed to load profile.",
        });
    }
};


const updateProfile = async (
    req,
    res
) => {

    try {

        const user =
            await updateUserProfile(
                req.userId,
                req.body
            );

        res.status(200).json({

            success: true,

            message:
                "Profile updated successfully.",

            user,
        });

    } catch (error) {

        res.status(
            error.statusCode || 500
        ).json({
            message:
                error.message ||
                "Failed to update profile.",
        });
    }
};


const updateProfileImageController =
    async (
        req,
        res
    ) => {

        try {

            const user =
                await updateProfileImage(
                    req.userId,
                    req.file
                );


            res.status(200).json({

                success: true,

                message:
                    "Profile image updated successfully.",

                user,
            });

        } catch (error) {

            res.status(
                error.statusCode || 500
            ).json({
                message:
                    error.message ||
                    "Failed to update profile image.",
            });
        }
    };


module.exports = {
    getProfile,
    updateProfile,
    updateProfileImageController,
};