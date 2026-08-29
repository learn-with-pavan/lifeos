const User = require("../models/User");

const cloudinary =
    require("../config/cloudinary");

const streamifier =
    require("streamifier");


const getUserProfile = async (
    userId
) => {

    const user =
        await User.findById(
            userId
        ).select(
            "-password"
        );

    if (!user) {

        const error =
            new Error(
                "User profile not found."
            );

        error.statusCode = 404;

        throw error;
    }

    return user;
};


const updateUserProfile = async (
    userId,
    profileData
) => {

    const {
        name,
        phone,
        address,
    } = profileData;


    const user =
        await User.findById(
            userId
        );

    if (!user) {

        const error =
            new Error(
                "User profile not found."
            );

        error.statusCode = 404;

        throw error;
    }


    if (
        typeof name === "string" &&
        name.trim()
    ) {

        user.name =
            name.trim();
    }


    if (
        typeof phone === "string"
    ) {

        user.phone =
            phone.trim();
    }


    if (
        address &&
        typeof address === "object"
    ) {

        user.address = {

            ...user.address?.toObject?.(),

            addressLine1:
                address.addressLine1?.trim() ||
                "",

            addressLine2:
                address.addressLine2?.trim() ||
                "",

            city:
                address.city?.trim() ||
                "",

            state:
                address.state?.trim() ||
                "",

            postalCode:
                address.postalCode?.trim() ||
                "",

            country:
                address.country?.trim() ||
                "India",
        };
    }


    await user.save();


    return User.findById(
        user._id
    ).select(
        "-password"
    );
};


const uploadToCloudinary = (
    fileBuffer,
    options
) => {

    return new Promise(
        (
            resolve,
            reject
        ) => {

            const stream =
                cloudinary
                    .uploader
                    .upload_stream(
                        options,
                        (
                            error,
                            result
                        ) => {

                            if (error) {
                                reject(error);
                                return;
                            }

                            resolve(result);
                        }
                    );


            streamifier
                .createReadStream(
                    fileBuffer
                )
                .pipe(stream);
        }
    );
};


const updateProfileImage = async (
    userId,
    file
) => {

    const user =
        await User.findById(
            userId
        );

    if (!user) {

        const error =
            new Error(
                "User profile not found."
            );

        error.statusCode = 404;

        throw error;
    }


    if (!file) {

        const error =
            new Error(
                "Profile image is required."
            );

        error.statusCode = 400;

        throw error;
    }


    const folder =
        process.env.CLOUDINARY_FOLDER ||
        "lifeos/dev/profiles";


    const uploadResult =
        await uploadToCloudinary(
            file.buffer,
            {
                folder,

                resource_type:
                    "image",

                transformation: [
                    {
                        width: 500,
                        height: 500,
                        crop: "fill",
                        gravity: "face",
                    },
                ],
            }
        );


    user.profileImage =
        uploadResult.secure_url;


    await user.save();


    return User.findById(
        user._id
    ).select(
        "-password"
    );
};


module.exports = {
    getUserProfile,
    updateUserProfile,
    updateProfileImage,
};