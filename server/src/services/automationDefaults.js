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
            "Notify the customer when a service is completed and invite them to review the provider.",

        event: "SERVICE_COMPLETED",

        conditions: {
            recipientRole: "CUSTOMER",
        },

        actions: [
            {
                type: "SEND_NOTIFICATION",

                config: {
                    notificationType:
                        "SERVICE_REVIEW_REQUEST",

                    title:
                        "⭐ Rate your service",

                    message:
                        "Your service has been completed. How was your experience? Tap here to rate your service.",
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
    }
];

const SERVICE_REQUEST_AUTOMATIONS = [

    /*
     * CUSTOMER
     */

    {
        name: "Service Request Accepted",
        description:
            "Notify the customer when a provider accepts the service request.",
        event: "SERVICE_REQUEST_ACCEPTED",

        conditions: {
            recipientRole: "CUSTOMER",
        },

        actions: [
            {
                type: "SEND_NOTIFICATION",
                config: {
                    title: "Service request accepted",
                    message:
                        "Your service request has been accepted by the provider.",
                },
            },
        ],
    },

    {
        name: "Service Request Rejected",
        description:
            "Notify the customer when a provider rejects the service request.",
        event: "SERVICE_REQUEST_REJECTED",

        conditions: {
            recipientRole: "CUSTOMER",
        },

        actions: [
            {
                type: "SEND_NOTIFICATION",
                config: {
                    title: "Service request rejected",
                    message:
                        "Your service request was rejected by the provider.",
                },
            },
        ],
    },

    {
        name: "Service Appointment Scheduled",
        description:
            "Notify the customer when the provider schedules the service.",
        event: "SERVICE_REQUEST_SCHEDULED",

        conditions: {
            recipientRole: "CUSTOMER",
        },

        actions: [
            {
                type: "SEND_NOTIFICATION",
                config: {
                    title: "Service appointment scheduled",
                    message:
                        "Your service appointment has been scheduled.",
                },
            },
        ],
    },

    {
        name: "Service Appointment Rescheduled",
        description:
            "Notify the customer when the provider changes the appointment.",
        event: "SERVICE_REQUEST_RESCHEDULED",

        conditions: {
            recipientRole: "CUSTOMER",
        },

        actions: [
            {
                type: "SEND_NOTIFICATION",
                config: {
                    title: "Service appointment rescheduled",
                    message:
                        "Your service appointment has been rescheduled.",
                },
            },
        ],
    },

    {
        name: "Service Request Cancelled",
        description:
            "Notify the provider when the customer cancels a service request.",
        event: "SERVICE_REQUEST_CANCELLED",

        conditions: {
            recipientRole: "PROVIDER",
        },

        actions: [
            {
                type: "SEND_NOTIFICATION",
                config: {
                    title: "Service request cancelled",
                    message:
                        "The customer cancelled this service request.",
                },
            },
        ],
    },

    {
        name: "Service Started",
        description:
            "Notify the customer when the provider starts the service.",
        event: "SERVICE_STARTED",

        conditions: {
            recipientRole: "CUSTOMER",
        },

        actions: [
            {
                type: "SEND_NOTIFICATION",
                config: {
                    title: "Service started",
                    message:
                        "The service work has started.",
                },
            },
        ],
    },

    {
        name: "Service Completed",
        description:
            "Notify the customer when a service is completed and invite them to review the provider.",
        event: "SERVICE_COMPLETED",

        conditions: {
            recipientRole: "CUSTOMER",
        },

        actions: [
            {
                type: "SEND_NOTIFICATION",
                config: {
                    title: "⭐ Rate your service",
                    message:
                        "Your service has been completed. How was your experience? Tap here to rate your service.",
                },
            },
        ],
    },

    /*
     * PROVIDER
     */

    {
        name: "New Service Request",
        description:
            "Notify the provider when a customer creates a service request.",
        event: "SERVICE_REQUEST_CREATED",

        conditions: {
            recipientRole: "PROVIDER",
        },

        actions: [
            {
                type: "SEND_NOTIFICATION",
                config: {
                    title: "New service request",
                    message:
                        "You have received a new service request from a customer.",
                },
            },
        ],
    },

    // Payment
    {
        name: "Payment Required",

        description:
            "Notify the customer when payment is created for a completed service.",

        event: "PAYMENT_CREATED",

        conditions: {
            recipientRole: "CUSTOMER",
        },

        actions: [
            {
                type: "SEND_NOTIFICATION",

                config: {
                    title: "Payment required",

                    message:
                        "A payment is required for your completed service.",
                },
            },
        ],
    },
    {
        type: "PAYMENT_COMPLETED",
        title: "Payment successful",
        message:
            "Your payment has been completed successfully.",
        recipientRole: "CUSTOMER",
    }
];

const ALL_DEFAULT_AUTOMATIONS = [
    ...DEFAULT_AUTOMATIONS,
    ...SERVICE_REQUEST_AUTOMATIONS

]

const createDefaultAutomations = async (
    userId
) => {

    const automations =
        ALL_DEFAULT_AUTOMATIONS.map(
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
                    $set: {
                        description:
                            automation.description,

                        conditions:
                            automation.conditions,

                        actions:
                            automation.actions,

                        enabled:
                            automation.enabled,
                    },

                    $setOnInsert: {
                        user: userId,
                        event: automation.event,
                        name: automation.name,
                    },
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