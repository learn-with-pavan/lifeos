const cloudinary = require("../config/cloudinary");


const uploadProfileImage = async (fileBuffer, userId) => {
    if (!fileBuffer) {
        const error = new Error("Profile image file is required.");
        error.statusCode = 400;
        throw error;
    }

    return new Promise((resolve, reject) => {

        const uploadStream =
            cloudinary.uploader.upload_stream(
                {
                    folder: "lifeos/profiles",
                    public_id: `user_${userId}`,
                    overwrite: true,
                    invalidate: true,
                    resource_type: "image",
                },

                (error, result) => {
                    if (error) {
                        return reject(error);
                    }
                    resolve(result);
                }
            );

        uploadStream.end(
            fileBuffer
        );
    }
    );
};


const deleteProfileImage = async (publicId) => {
    if (!publicId) {
        return;
    }

    await cloudinary.uploader.destroy(publicId,
        {
            resource_type: "image",
        }
    );
};


module.exports = {
    uploadProfileImage,
    deleteProfileImage,
};