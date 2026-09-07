const multer = require("multer");

const storage = multer.memoryStorage();

const allowedMimeTypes = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
];

const fileFilter = (
    req,
    file,
    cb
) => {

    if (
        allowedMimeTypes.includes(
            file.mimetype
        )
    ) {
        cb(null, true);
        return;
    }

    const error = new Error(
        "Only PDF, JPG, JPEG, PNG, WEBP and GIF files are allowed."
    );

    error.statusCode = 400;

    cb(error);
};

const upload = multer({
    storage,

    limits: {
        fileSize:
            10 * 1024 * 1024,

        files: 10,
    },

    fileFilter,
});

module.exports = upload;