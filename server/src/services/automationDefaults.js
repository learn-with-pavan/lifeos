const Automation = require("../models/Automation");

const DEFAULT_AUTOMATIONS = [
    {
        name: "Warranty Expiring",
        description:
            "Notify when an asset warranty is approaching expiry.",
        event: "WARRANTY_EXPIRING",

        conditions: {
            daysBefore: 30,
        },

        actions: [
            {
                type: "CREATE_REMINDER",
                config: {
                    remindBeforeDays: 30,
                },
            },
            {
                type: "SEND_NOTIFICATION",
                config: {
                    title: "Warranty expiring soon",
                    message:
                        "Your asset warranty is expiring in 30 days.",
                },
            },
        ],
    },

    {
        name: "Maintenance Due Soon",
        description:
            "Notify when scheduled maintenance is approaching.",
        event: "MAINTENANCE_DUE_SOON",

        conditions: {
            daysBefore: 7,
        },

        actions: [
            {
                type: "SEND_NOTIFICATION",
                config: {
                    title: "Maintenance due soon",
                    message:
                        "Your asset has maintenance coming up.",
                },
            },
        ],
    },

    {
        name: "Maintenance Overdue",
        description:
            "Notify when scheduled maintenance has passed its due date.",
        event: "MAINTENANCE_OVERDUE",

        conditions: {},

        actions: [
            {
                type: "SEND_NOTIFICATION",
                config: {
                    title: "Maintenance overdue",
                    message:
                        "Your asset has overdue maintenance.",
                },
            },
        ],
    },

    {
        name: "Service Completed",
        description:
            "Notify after a service or repair is recorded.",
        event: "SERVICE_COMPLETED",

        conditions: {},

        actions: [
            {
                type: "SEND_NOTIFICATION",
                config: {
                    title: "Service completed",
                    message:
                        "A service or repair has been recorded for your asset.",
                },
            },
        ],
    },

    {
        name: "Asset Needs Repair",
        description:
            "Notify when an asset is marked as needing repair.",
        event: "ASSET_NEEDS_REPAIR",

        conditions: {},

        actions: [
            {
                type: "SEND_NOTIFICATION",
                config: {
                    title: "Asset needs repair",
                    message:
                        "One of your assets needs attention.",
                },
            },
        ],
    },
];


const createDefaultAutomations = async (
    userId
) => {

    const automations =
        DEFAULT_AUTOMATIONS.map(
            (automation) => ({
                user: userId,
                ...automation,
                enabled: true,
            })
        );

    const result = await Automation.bulkWrite(
        automations.map((automation) => ({
            updateOne: {
                filter: {
                    user: userId,
                    event: automation.event,
                    name: automation.name,
                },
                update: {
                    $setOnInsert: automation,
                },
                upsert: true,
            },
        }))
    );

    return {
        createdCount: result.upsertedCount,
    };
};


module.exports = {
    createDefaultAutomations,
};