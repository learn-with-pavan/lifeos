const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const ServiceProvider = require("../models/ServiceProvider");

const registerUser = async ({ name, email, password }) => {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
        const error = new Error("User already exists");
        error.statusCode = 409;
        throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
        name,
        email,
        password: hashedPassword,
    });

    return {
        id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage
    };
}

const registerProviderUser = async ({
    name,
    email,
    password,
    businessName,
}) => {

    const existingUser =
        await User.findOne({
            email,
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
            email,
            password: hashedPassword,
            role: "PROVIDER",
        });


    try {

        const provider =
            await ServiceProvider.create({
                user: user._id,

                businessName,

                verificationStatus:
                    "PENDING",

                isActive: false,

                availability:
                    "UNAVAILABLE",
            });


        return {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },

            provider: {
                id: provider._id,
                businessName:
                    provider.businessName,

                verificationStatus:
                    provider.verificationStatus,

                isActive:
                    provider.isActive,
            },
        };

    } catch (error) {

        await User.findByIdAndDelete(
            user._id
        );

        throw error;
    }
};

const loginUser = async ({ email, password }) => {

    const user =
        await User.findOne({
            email,
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


    const token =
        jwt.sign(
            {
                userId: user._id.toString(),
                role: user.role || "CUSTOMER",
            },

            process.env.JWT_SECRET,

            {
                expiresIn: "7d",
            }
        );


    return {
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role || "CUSTOMER",
            profileImage: user.profileImage
        },
    };
};

module.exports = { registerUser, registerProviderUser, loginUser }