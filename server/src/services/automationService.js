const Automation =
    require("../models/Automation");

const AutomationExecution =
    require("../models/AutomationExecution");
const { createAutomationNotification } = require("./notificationService");

const {
    createWarrantyReminder,
} = require("./reminderService");

const EXECUTION_LEASE_MS = 5 * 60 * 1000;
const RETRY_BASE_DELAY_MS = 60 * 1000;


const matchesConditions = (
    eventData,
    conditions
) => {

    if (!conditions) {
        return true;
    }

    if (
        conditions.daysBefore !== undefined &&
        eventData.daysBefore >
        conditions.daysBefore
    ) {
        return false;
    }

    if (
        conditions.assetCategory &&
        eventData.assetCategory !==
        conditions.assetCategory
    ) {
        return false;
    }

    return true;
};


const executeAction = async (
    automation,
    action,
    eventData,
    automationKey
) => {

    switch (action.type) {

        case "CREATE_REMINDER": {

            if (
                automation.event ===
                "WARRANTY_EXPIRING"
            ) {

                try {
                    await createWarrantyReminder(
                        eventData.userId,
                        eventData.assetId,
                        action.config
                            ?.remindBeforeDays ??
                        automation.conditions
                            ?.daysBefore ??
                        30
                    );
                } catch (error) {
                    if (error.statusCode !== 409) {
                        throw error;
                    }
                }
            }

            break;
        }


        case "SEND_NOTIFICATION": {

            await createAutomationNotification({
                userId:
                    eventData.userId,

                assetId:
                    eventData.assetId,

                title:
                    action.config?.title ||
                    automation.name,

                message:
                    action.config?.message ||
                    eventData.message ||
                    "You have something that requires your attention.",

                eventType:
                    automation.event,

                automationKey,
            });

            break;
        }


        default:
            throw new Error(
                `Unknown automation action: ${action.type}`
            );
    }
};

const claimExecution = async ({
    automation,
    eventType,
    eventData,
    entityId,
}) => {
    const now = new Date();
    const executionKey =
        `${automation._id}:${eventType}:${entityId}`;

    try {
        return await AutomationExecution.findOneAndUpdate(
            {
                executionKey,
                $or: [
                    {
                        status: "FAILED",
                        nextAttemptAt: {
                            $lte: now,
                        },
                    },
                    {
                        status: "PROCESSING",
                        leaseUntil: {
                            $lt: now,
                        },
                    },
                ],
            },
            {
                $set: {
                    status: "PROCESSING",
                    leaseUntil: new Date(
                        now.getTime() +
                        EXECUTION_LEASE_MS
                    ),
                    nextAttemptAt: null,
                },
                $setOnInsert: {
                    user: eventData.userId,
                    automation: automation._id,
                    event: eventType,
                    entity: entityId,
                    executionKey,
                },
            },
            {
                upsert: true,
                returnDocument: "after",
            }
        );
    } catch (error) {
        if (error.code === 11000) {
            return null;
        }

        throw error;
    }
};


const processEvent = async (
    eventType,
    eventData
) => {

    try {

        const automations =
            await Automation.find({
                event: eventType,
                enabled: true,
                user: eventData.userId,
            });

        if (
            automations.length === 0
        ) {
            return;
        }

        for (
            const automation
            of automations
        ) {

            const matches =
                matchesConditions(
                    eventData,
                    automation.conditions
                );

            if (!matches) {
                continue;
            }

            /*
             * Prevent duplicate execution.
             *
             * Example:
             *
             * MAINTENANCE_OVERDUE
             * maintenanceId = ABC
             *
             * The worker may run every hour,
             * but this automation should execute
             * only once for that maintenance.
             */

            const entityId =
                eventData.entityId ||
                eventData.serviceHistoryId ||
                eventData.maintenanceId ||
                eventData.warrantyId ||
                eventData.assetId;

            if (!entityId) {
                throw new Error(
                    `Automation event ${eventType} has no entity identifier`
                );
            }

            const execution = await claimExecution({
                automation,
                eventType,
                eventData,
                entityId,
            });

            if (!execution) {
                continue;
            }

            try {
                for (
                    let actionIndex = 0;
                    actionIndex < automation.actions.length;
                    actionIndex += 1
                ) {
                    const action =
                        automation.actions[actionIndex];

                    await executeAction(
                        automation,
                        action,
                        eventData,
                        `${automation._id}:${eventType}:${entityId}:${actionIndex}`
                    );
                }

                await AutomationExecution.updateOne(
                    { _id: execution._id },
                    {
                        $set: {
                            status: "COMPLETED",
                            leaseUntil: null,
                            lastError: null,
                        },
                    }
                );
            } catch (error) {
                const attempts =
                    (execution.attempts || 0) + 1;
                const retryDelay = Math.min(
                    RETRY_BASE_DELAY_MS *
                    (2 ** Math.min(attempts - 1, 5)),
                    30 * 60 * 1000
                );

                await AutomationExecution.updateOne(
                    { _id: execution._id },
                    {
                        $set: {
                            status: "FAILED",
                            leaseUntil: null,
                            lastError: error.message,
                            nextAttemptAt: new Date(
                                Date.now() + retryDelay
                            ),
                        },
                        $inc: {
                            attempts: 1,
                        },
                    }
                );

                console.error(
                    `Automation action failed: ${automation._id}`,
                    error
                );
            }
        }

    } catch (error) {

        console.error(
            "Automation event processing failed:",
            error
        );

        throw error;
    }
};


module.exports = {
    processEvent,
};