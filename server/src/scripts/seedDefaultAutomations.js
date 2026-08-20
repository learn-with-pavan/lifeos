require("dotenv").config();

const connectDatabase =
    require("../config/db");

const User =
    require("../models/User");

const {
    createDefaultAutomations,
} = require("../services/automationDefaults");


const seed = async () => {

    try {

        await connectDatabase();

        const users =
            await User.find({});

        for (const user of users) {

            const result =
                await createDefaultAutomations(
                    user._id
                );

            console.log(
                `${user.email}: ${result.createdCount} automations created`
            );
        }

        console.log(
            "Default automation seeding completed."
        );

        process.exit(0);

    } catch (error) {

        console.error(
            "Automation seed failed:",
            error
        );

        process.exit(1);
    }
};


seed();