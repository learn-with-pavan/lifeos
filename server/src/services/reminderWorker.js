const cron = require("node-cron");

const Reminder = require("../models/Reminder");

const {
    createWarrantyNotification,
} = require("../services/notificationService");


const processReminders = async () => {

    try {

        const now = new Date();

        const reminders =
            await Reminder.find({
                status: "PENDING",
                reminderDate: {
                    $lte: now,
                },
            });


        if (reminders.length === 0) {
            return;
        }


        console.log(
            `Found ${reminders.length} pending reminder(s)`
        );


        for (
            const reminder
            of reminders
        ) {

            try {

                /*
                 * Create notification
                 * using the existing warranty
                 * reminder flow.
                 */

                await createWarrantyNotification(
                    reminder._id
                );


                /*
                 * Mark reminder as processed.
                 */

                reminder.status = "SENT";

                reminder.sentAt =
                    new Date();

                await reminder.save();


                console.log(
                    `Reminder processed: ${reminder._id}`
                );

            } catch (error) {

                console.error(
                    `Failed to process reminder ${reminder._id}:`,
                    error.message
                );
            }
        }

    } catch (error) {

        console.error(
            "Reminder worker failed:",
            error
        );
    }
};


const startReminderWorker = () => {

    cron.schedule(
        "* * * * *",
        processReminders
    );

    console.log(
        "Reminder worker started"
    );
};


module.exports = {
    startReminderWorker,
};