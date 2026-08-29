const multer = require("multer");


const storage =
    multer.memoryStorage();


const fileFilter = (
    req,
    file,
    cb
) => {

    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
    ];


    if (
        allowedTypes.includes(
            file.mimetype
        )
    ) {

        cb(null, true);

    } else {

        const error =
            new Error(
                "Only JPG, PNG, WEBP, and GIF images are allowed."
            );

        error.statusCode = 400;

        cb(error, false);
    }
};


const uploadProfileImage =
    multer({

        storage,

        limits: {
            fileSize:
                5 * 1024 * 1024,
        },

        fileFilter,
    });


module.exports = {
    uploadProfileImage,
};