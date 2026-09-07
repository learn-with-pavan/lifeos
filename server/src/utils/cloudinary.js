const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

const uploadBufferToCloudinary = (
    buffer,
    options = {}
) => {
    return new Promise(
        (resolve, reject) => {

            const uploadStream =
                cloudinary.uploader.upload_stream(
                    options,
                    (error, result) => {

                        if (error) {
                            reject(error);
                            return;
                        }

                        resolve(result);
                    }
                );

            streamifier
                .createReadStream(buffer)
                .pipe(uploadStream);
        }
    );
};


const deleteFromCloudinary = async (
    publicId,
    resourceType = "image"
) => {

    if (!publicId) {
        return;
    }

    return cloudinary.uploader.destroy(
        publicId,
        {
            resource_type: resourceType,
        }
    );
};


module.exports = {
    cloudinary,
    uploadBufferToCloudinary,
    deleteFromCloudinary,
};