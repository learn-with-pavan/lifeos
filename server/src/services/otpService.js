const crypto = require("crypto");

const Otp = require("../models/Otp");
const { sendOtpEmail } = require("./emailService");

const OTP_EXPIRY_SECONDS = 600;
const OTP_RESEND_SECONDS = 30;
const MAX_ATTEMPTS = 5;

const generateOtp = () => {
    return crypto
        .randomInt(100000, 1000000)
        .toString();
};

const hashOtp = (otp) => {
    return crypto
        .createHash("sha256")
        .update(otp)
        .digest("hex");
};

const normalizeIdentifier = (identifier) => {
    return identifier
        .trim()
        .toLowerCase();
};

const sendOtp = async ({
    identifier,
    purpose,
}) => {

    const normalizedIdentifier =
        normalizeIdentifier(identifier);

    const existingOtp =
        await Otp.findOne({
            identifier: normalizedIdentifier,
            purpose,
        });

    if (existingOtp) {

        const elapsed =
            Date.now() -
            new Date(
                existingOtp.createdAt
            ).getTime();

        if (
            elapsed <
            OTP_RESEND_SECONDS * 1000
        ) {

            const remainingSeconds =
                Math.ceil(
                    (
                        OTP_RESEND_SECONDS * 1000 -
                        elapsed
                    ) / 1000
                );

            const error = new Error(
                `Please wait ${remainingSeconds} seconds before requesting another OTP.`
            );

            error.statusCode = 429;

            throw error;
        }
    }

    const otp = generateOtp();

    const otpHash = hashOtp(otp);

    const expiresAt =
        new Date(
            Date.now() +
            OTP_EXPIRY_SECONDS * 1000
        );

    await Otp.deleteMany({
        identifier: normalizedIdentifier,
        purpose,
    });

    await Otp.create({
        identifier: normalizedIdentifier,
        otpHash,
        purpose,
        attempts: 0,
        expiresAt,
    });

    await sendOtpEmail({
        email: normalizedIdentifier,
        otp,
        purpose,
    });

    return {
        expiresIn: OTP_EXPIRY_SECONDS,
        resendAfter: OTP_RESEND_SECONDS,
    };
};

const verifyOtp = async ({
    identifier,
    otp,
    purpose,
}) => {

    const normalizedIdentifier =
        normalizeIdentifier(identifier);

    const record =
        await Otp.findOne({
            identifier: normalizedIdentifier,
            purpose,
        });

    if (!record) {

        const error = new Error(
            "OTP not found or expired."
        );

        error.statusCode = 400;

        throw error;
    }

    if (
        record.expiresAt.getTime() <
        Date.now()
    ) {

        await Otp.deleteOne({
            _id: record._id,
        });

        const error = new Error(
            "OTP has expired. Please request a new one."
        );

        error.statusCode = 400;

        throw error;
    }

    if (
        record.attempts >=
        MAX_ATTEMPTS
    ) {

        await Otp.deleteOne({
            _id: record._id,
        });

        const error = new Error(
            "Too many incorrect attempts. Please request a new OTP."
        );

        error.statusCode = 429;

        throw error;
    }

    const submittedHash =
        hashOtp(otp);

    if (
        submittedHash !==
        record.otpHash
    ) {

        record.attempts += 1;

        await record.save();

        const remaining =
            MAX_ATTEMPTS -
            record.attempts;

        const error = new Error(
            remaining > 0
                ? `Invalid OTP. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`
                : "Invalid OTP. Please request a new code."
        );

        error.statusCode = 400;

        throw error;
    }

    await Otp.deleteOne({
        _id: record._id,
    });

    return true;
};

module.exports = {
    sendOtp,
    verifyOtp,
};