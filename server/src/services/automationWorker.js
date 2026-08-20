const cron = require("node-cron");

const Warranty =
    require("../models/Warranty");

const Maintenance =
    require("../models/Maintenance");

const {
    processEvent,
} = require("../services/automationService");


/*
 * Number of days before maintenance
 * when we consider it "due soon".
 *
 * This must match the default automation
 * condition:
 *
 * daysBefore: 7
 */

const MAINTENANCE_DUE_SOON_DAYS = Number(
    process.env.MAINTENANCE_DUE_SOON_DAYS || 7
);

const WARRANTY_LOOKAHEAD_DAYS = Number(
    process.env.WARRANTY_LOOKAHEAD_DAYS || 365
);


/*
 * Process warranty automations
 */

const processWarrantyAutomations =
    async (now) => {

        const futureDate =
            new Date(now);

        futureDate.setDate(
            futureDate.getDate() +
            WARRANTY_LOOKAHEAD_DAYS
        );

        const warranties =
            await Warranty.find({
                startDate: {
                    $lte: futureDate,
                },

                endDate: {
                    $gte: now,
                },
            }).populate(
                "asset",
                "name category user"
            );


        for (
            const warranty
            of warranties
        ) {

            if (!warranty.asset) {
                continue;
            }


            const endDate =
                new Date(
                    warranty.endDate
                );


            const difference =
                endDate.getTime() -
                now.getTime();


            const daysBefore =
                Math.ceil(
                    difference /
                    (1000 * 60 * 60 * 24)
                );


            if (daysBefore < 0) {
                continue;
            }


            await processEvent(
                "WARRANTY_EXPIRING",
                {
                    userId:
                        warranty.asset.user,

                    assetId:
                        warranty.asset._id,

                    entityId:
                        warranty._id,

                    warrantyId:
                        warranty._id,

                    assetCategory:
                        warranty.asset.category,

                    daysBefore,

                    message:
                        `${warranty.asset.name} warranty expires in ${Math.max(
                            daysBefore,
                            0
                        )} days.`,
                }
            );
        }
    };


/*
 * Process maintenance automations
 */

const processMaintenanceAutomations =
    async (now) => {

        const maintenanceRecords =
            await Maintenance.find({
                dueDate: {
                    $lte: new Date(
                        now.getTime() +
                        MAINTENANCE_DUE_SOON_DAYS *
                        24 *
                        60 *
                        60 *
                        1000
                    ),
                },
            }).populate(
                "asset",
                "name category user"
            );


        for (
            const maintenance
            of maintenanceRecords
        ) {

            if (!maintenance.asset) {
                continue;
            }


            const dueDate =
                new Date(
                    maintenance.dueDate
                );


            const difference =
                dueDate.getTime() -
                now.getTime();


            const daysBefore =
                Math.ceil(
                    difference /
                    (1000 * 60 * 60 * 24)
                );


            /*
             * OVERDUE
             *
             * Due date has already passed.
             */

            if (
                dueDate < now
            ) {

                await processEvent(
                    "MAINTENANCE_OVERDUE",
                    {
                        userId:
                            maintenance.user,

                        assetId:
                            maintenance.asset._id,

                        entityId:
                            maintenance._id,

                        maintenanceId:
                            maintenance._id,

                        assetCategory:
                            maintenance.asset.category,

                        daysBefore,

                        title:
                            maintenance.title,

                        message:
                            `${maintenance.title} for ${maintenance.asset.name} is overdue.`,
                    }
                );

                continue;
            }


            /*
             * DUE SOON
             *
             * Exactly 7 days before
             * the maintenance date.
             */

            if (
                daysBefore >= 0 &&
                daysBefore <=
                MAINTENANCE_DUE_SOON_DAYS
            ) {

                await processEvent(
                    "MAINTENANCE_DUE_SOON",
                    {
                        userId:
                            maintenance.user,

                        assetId:
                            maintenance.asset._id,

                        entityId:
                            maintenance._id,

                        maintenanceId:
                            maintenance._id,

                        assetCategory:
                            maintenance.asset.category,

                        daysBefore,

                        title:
                            maintenance.title,

                        message:
                            `${maintenance.title} for ${maintenance.asset.name} is due in ${daysBefore} days.`,
                    }
                );
            }
        }
    };


/*
 * Main automation worker
 */

const processAutomations =
    async () => {

        try {

            const now =
                new Date();


            console.log(
                "Automation worker running:",
                now
            );


            await processWarrantyAutomations(
                now
            );


            await processMaintenanceAutomations(
                now
            );


        } catch (error) {

            console.error(
                "Automation worker failed:",
                error
            );
        }
    };


/*
 * Start worker
 */

const startAutomationWorker =
    () => {

        cron.schedule(
            "* * * * *",
            processAutomations,
            {
                noOverlap: true,
            }
        );

        console.log(
            "Automation worker started"
        );
    };


module.exports = {
    startAutomationWorker,
    processAutomations,
};