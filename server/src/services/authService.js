const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const ServiceProvider = require("../models/ServiceProvider");

const {
    sendOtp,
    verifyOtp,
} = require("./otpService");


const createToken = (user) => {

    return jwt.sign(
        {
            userId:
                user._id.toString(),

            role:
                user.role || "CUSTOMER",
        },

        process.env.JWT_SECRET,

        {
            expiresIn: "7d",
        }
    );
};


const buildUserResponse = (user) => {

    return {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || "CUSTOMER",
        phone: user.phone,
        profileImage: user.profileImage,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
    };
};


const registerUser = async ({
    name,
    email,
    password,
    phone = "",
}) => {

    const normalizedEmail =
        email.trim().toLowerCase();

    const existingUser =
        await User.findOne({
            email: normalizedEmail,
        });

    if (existingUser) {

        const error =
            new Error(
                "User already exists"
            );

        error.statusCode = 409;

        throw error;
    }

    const hashedPassword =
        await bcrypt.hash(
            password,
            10
        );

    const user =
        await User.create({
            name,
            email: normalizedEmail,
            password: hashedPassword,
            phone,
            emailVerified: false,
        });

    try {

        await sendOtp({
            identifier: normalizedEmail,
            purpose: "REGISTER",
        });

    } catch (error) {

        await User.findByIdAndDelete(
            user._id
        );

        throw error;
    }

    return {
        otpRequired: true,
        user: buildUserResponse(user),
        message:
            "Verification code sent to your email.",
    };
};


const registerProviderUser = async ({
    name,
    email,
    password,
    businessName,
    phone = "",
}) => {

    const normalizedEmail =
        email.trim().toLowerCase();

    const existingUser =
        await User.findOne({
            email: normalizedEmail,
        });

    if (existingUser) {

        const error =
            new Error(
                "User already exists"
            );

        error.statusCode = 409;

        throw error;
    }

    const hashedPassword =
        await bcrypt.hash(
            password,
            10
        );

    const user =
        await User.create({
            name,
            email: normalizedEmail,
            password: hashedPassword,
            role: "PROVIDER",
            phone,
            emailVerified: false,
        });

    try {

        const provider =
            await ServiceProvider.create({
                user: user._id,
                businessName,
                verificationStatus: "VERIFIED",
                isActive: true,
                availability: "AVAILABLE",
            });

        try {

            await sendOtp({
                identifier: normalizedEmail,
                purpose: "REGISTER",
            });

        } catch (error) {

            await ServiceProvider.findByIdAndDelete(
                provider._id
            );

            await User.findByIdAndDelete(
                user._id
            );

            throw error;
        }

        return {
            otpRequired: true,

            user:
                buildUserResponse(
                    user
                ),

            provider: {
                id:
                    provider._id,

                businessName:
                    provider.businessName,

                verificationStatus:
                    provider.verificationStatus,

                isActive:
                    provider.isActive,
            },

            message:
                "Verification code sent to your email.",
        };

    } catch (error) {

        await User.findByIdAndDelete(
            user._id
        );

        throw error;
    }
};


const verifyRegistrationOtp = async ({
    email,
    otp,
}) => {

    const normalizedEmail =
        email.trim().toLowerCase();

    await verifyOtp({
        identifier: normalizedEmail,
        otp,
        purpose: "REGISTER",
    });

    const user =
        await User.findOne({
            email: normalizedEmail,
        });

    if (!user) {

        const error =
            new Error(
                "Account no longer exists."
            );

        error.statusCode = 404;

        throw error;
    }

    user.emailVerified = true;

    await user.save();

    const token =
        createToken(user);

    return {
        token,

        user:
            buildUserResponse(
                user
            ),
    };
};


const loginUser = async ({
    email,
    password,
}) => {

    const normalizedEmail =
        email.trim().toLowerCase();

    const user =
        await User.findOne({
            email: normalizedEmail,
        });

    if (!user) {

        const error =
            new Error(
                "Invalid email or password"
            );

        error.statusCode = 401;

        throw error;
    }

    const isPasswordValid =
        await bcrypt.compare(
            password,
            user.password
        );

    if (!isPasswordValid) {

        const error =
            new Error(
                "Invalid email or password"
            );

        error.statusCode = 401;

        throw error;
    }

    await sendOtp({
        identifier: normalizedEmail,
        purpose: "LOGIN",
    });

    return {
        otpRequired: true,
        message:
            "Verification code sent to your email.",
    };
};


const sendLoginOtp = async ({
    email,
}) => {

    const normalizedEmail =
        email.trim().toLowerCase();

    const user =
        await User.findOne({
            email: normalizedEmail,
        });

    if (!user) {

        const error =
            new Error(
                "No account found with this email address."
            );

        error.statusCode = 404;

        throw error;
    }

    return sendOtp({
        identifier: normalizedEmail,
        purpose: "LOGIN",
    });
};


const sendRegistrationOtp = async ({
    email,
}) => {

    const normalizedEmail =
        email.trim().toLowerCase();

    const user =
        await User.findOne({
            email: normalizedEmail,
        });

    if (!user) {

        const error =
            new Error(
                "Account not found."
            );

        error.statusCode = 404;

        throw error;
    }

    if (user.emailVerified) {

        const error =
            new Error(
                "Email is already verified."
            );

        error.statusCode = 400;

        throw error;
    }

    return sendOtp({
        identifier: normalizedEmail,
        purpose: "REGISTER",
    });
};


const verifyLoginOtp = async ({
    email,
    otp,
}) => {

    const normalizedEmail =
        email.trim().toLowerCase();

    await verifyOtp({
        identifier: normalizedEmail,
        otp,
        purpose: "LOGIN",
    });

    const user =
        await User.findOne({
            email: normalizedEmail,
        });

    if (!user) {

        const error =
            new Error(
                "Account no longer exists."
            );

        error.statusCode = 404;

        throw error;
    }

    const token =
        createToken(user);

    return {
        token,

        user:
            buildUserResponse(
                user
            ),
    };
};


module.exports = {
    registerUser,
    registerProviderUser,
    verifyRegistrationOtp,
    sendRegistrationOtp,
    loginUser,
    sendLoginOtp,
    verifyLoginOtp,
};