const { registerUser, loginUser } = require("../services/authService");
const { createDefaultAutomations } = require("../services/automationDefaults");

const register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            const error = new Error(
                "Name, email and password are required"
            );

            error.statusCode = 400;

            throw error;
        }

        const user = await registerUser({
            name,
            email,
            password,
        });

        await createDefaultAutomations(
            user._id
        );
        res.status(201).json({
            success: true,
            message: "Account created successfully",
            user,
        });
    } catch (error) {
        next(error);
    }
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            const error = new Error(
                "Email and password are required"
            );

            error.statusCode = 400;

            throw error;
        }

        const result = await loginUser({
            email,
            password,
        });

        res.status(200).json({
            success: true,
            message: "Login successful",
            ...result,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    login
};