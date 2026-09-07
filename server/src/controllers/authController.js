const {
    registerUser,
    loginUser,
    registerProviderUser,
    verifyRegistrationOtp,
    sendRegistrationOtp,
    sendLoginOtp,
    verifyLoginOtp,
} = require("../services/authService");


const {
    createDefaultAutomations,
} = require("../services/automationDefaults");


const register = async (
    req,
    res,
    next
) => {

    try {

        const {
            name,
            email,
            password,
            phone,
        } = req.body;

        if (
            !name ||
            !email ||
            !password
        ) {

            const error =
                new Error(
                    "Name, email and password are required"
                );

            error.statusCode = 400;

            throw error;
        }

        const result =
            await registerUser({
                name,
                email,
                password,
                phone,
            });

        return res.status(201).json({

            success: true,

            message:
                "Verification code sent successfully.",

            ...result,
        });

    } catch (error) {

        next(error);
    }
};


const registerProvider = async (
    req,
    res,
    next
) => {

    try {

        const {
            name,
            email,
            password,
            businessName,
            phone,
        } = req.body;

        if (
            !name ||
            !email ||
            !password ||
            !businessName
        ) {

            const error =
                new Error(
                    "Name, business name, email and password are required"
                );

            error.statusCode = 400;

            throw error;
        }

        const result =
            await registerProviderUser({
                name,
                email,
                password,
                businessName,
                phone,
            });

        return res.status(201).json({

            success: true,

            message:
                "Verification code sent successfully.",

            ...result,
        });

    } catch (error) {

        next(error);
    }
};


const verifyRegistration = async (
    req,
    res,
    next
) => {

    try {

        const {
            email,
            otp,
        } = req.body;

        if (
            !email ||
            !otp
        ) {

            const error =
                new Error(
                    "Email and OTP are required"
                );

            error.statusCode = 400;

            throw error;
        }

        if (
            !/^\d{6}$/.test(otp)
        ) {

            const error =
                new Error(
                    "OTP must be a 6-digit code"
                );

            error.statusCode = 400;

            throw error;
        }

        const result =
            await verifyRegistrationOtp({
                email,
                otp,
            });

        if (
            result.user?.role ===
            "CUSTOMER"
        ) {

            await createDefaultAutomations(
                result.user.id
            );
        }

        return res.status(200).json({

            success: true,

            message:
                "Account verified successfully.",

            ...result,
        });

    } catch (error) {

        next(error);
    }
};


const sendRegistrationOtpController =
    async (
        req,
        res,
        next
    ) => {

        try {

            const {
                email,
            } = req.body;

            if (!email) {

                const error =
                    new Error(
                        "Email is required"
                    );

                error.statusCode = 400;

                throw error;
            }

            const result =
                await sendRegistrationOtp({
                    email,
                });

            return res.status(200).json({

                success: true,

                message:
                    "Verification code sent successfully.",

                ...result,
            });

        } catch (error) {

            next(error);
        }
    };


const login = async (
    req,
    res,
    next
) => {

    try {

        const {
            email,
            password,
        } = req.body;

        if (
            !email ||
            !password
        ) {

            const error =
                new Error(
                    "Email and password are required"
                );

            error.statusCode = 400;

            throw error;
        }

        const result =
            await loginUser({
                email,
                password,
            });

        return res.status(200).json({

            success: true,

            message:
                "Verification code sent successfully.",

            ...result,
        });

    } catch (error) {

        next(error);
    }
};


const sendLoginOtpController =
    async (
        req,
        res,
        next
    ) => {

        try {

            const {
                email,
            } = req.body;

            if (!email) {

                const error =
                    new Error(
                        "Email is required"
                    );

                error.statusCode = 400;

                throw error;
            }

            const result =
                await sendLoginOtp({
                    email,
                });

            return res.status(200).json({

                success: true,

                message:
                    "Verification code sent successfully.",

                ...result,
            });

        } catch (error) {

            next(error);
        }
    };


const verifyLoginOtpController =
    async (
        req,
        res,
        next
    ) => {

        try {

            const {
                email,
                otp,
            } = req.body;

            if (
                !email ||
                !otp
            ) {

                const error =
                    new Error(
                        "Email and OTP are required"
                    );

                error.statusCode = 400;

                throw error;
            }

            if (
                !/^\d{6}$/.test(otp)
            ) {

                const error =
                    new Error(
                        "OTP must be a 6-digit code"
                    );

                error.statusCode = 400;

                throw error;
            }

            const result =
                await verifyLoginOtp({
                    email,
                    otp,
                });

            return res.status(200).json({

                success: true,

                message:
                    "Login successful",

                ...result,
            });

        } catch (error) {

            next(error);
        }
    };


module.exports = {

    register,

    registerProvider,

    verifyRegistration,

    sendRegistrationOtp:
        sendRegistrationOtpController,

    login,

    sendLoginOtp:
        sendLoginOtpController,

    verifyLoginOtp:
        verifyLoginOtpController,
};