require("dotenv").config();

const mongoose = require("mongoose");

const replaceIndex = async (
    collection,
    key,
    options
) => {
    const indexes = await collection.indexes();
    const matchingIndexes = indexes.filter(
        (index) =>
            Object.keys(key).every(
                (field) => index.key?.[field] === key[field]
            ) &&
            Object.keys(index.key).length ===
            Object.keys(key).length
    );

    for (const index of matchingIndexes) {
        await collection.dropIndex(index.name);
    }

    await collection.createIndex(key, options);
};

const migrate = async () => {
    await mongoose.connect(process.env.MONGO_URI);

    const notifications = mongoose.connection.collection(
        "notifications"
    );
    const reminders = mongoose.connection.collection(
        "reminders"
    );
    const automations = mongoose.connection.collection(
        "automations"
    );

    const automationDocuments = await automations
        .find({})
        .sort({ createdAt: 1, _id: 1 })
        .toArray();
    const automationGroups = new Map();

    for (const automation of automationDocuments) {
        const key = [
            automation.user,
            automation.event,
            automation.name,
        ].join("|");

        if (!automationGroups.has(key)) {
            automationGroups.set(key, automation._id);
            continue;
        }

        await automations.deleteOne({
            _id: automation._id,
        });
    }

    const duplicateReminders = await reminders
        .aggregate([
            {
                $match: {
                    status: {
                        $in: ["PENDING", "SENT"],
                    },
                },
            },
            {
                $group: {
                    _id: {
                        user: "$user",
                        asset: "$asset",
                        warranty: "$warranty",
                        type: "$type",
                    },
                    count: { $sum: 1 },
                },
            },
            {
                $match: {
                    count: { $gt: 1 },
                },
            },
        ])
        .toArray();

    if (duplicateReminders.length > 0) {
        throw new Error(
            "Migration stopped: duplicate active warranty reminders exist."
        );
    }

    await notifications.updateMany(
        { reminder: null },
        { $unset: { reminder: "" } }
    );

    await replaceIndex(
        notifications,
        { reminder: 1 },
        {
            name: "reminder_1",
            unique: true,
            sparse: true,
        }
    );

    await replaceIndex(
        notifications,
        { automationKey: 1 },
        {
            name: "automationKey_1",
            unique: true,
            sparse: true,
        }
    );

    await replaceIndex(
        reminders,
        {
            user: 1,
            asset: 1,
            warranty: 1,
            type: 1,
        },
        {
            name: "user_1_asset_1_warranty_1_type_1",
            unique: true,
            partialFilterExpression: {
                status: {
                    $in: ["PENDING", "SENT"],
                },
            },
        }
    );

    await replaceIndex(
        automations,
        {
            user: 1,
            event: 1,
            name: 1,
        },
        {
            name: "user_1_event_1_name_1",
            unique: true,
        }
    );

    console.log(
        "Automation indexes migrated successfully."
    );
};

migrate()
    .catch((error) => {
        console.error(
            "Automation index migration failed:",
            error
        );
        process.exitCode = 1;
    })
    .finally(async () => {
        await mongoose.disconnect();
    });