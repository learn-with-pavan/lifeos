const Home = require("../models/Home");
const Asset = require("../models/Asset");
const Document = require("../models/Document");
const Maintenance = require("../models/Maintenance");
const Reminder = require("../models/Reminder");
const ServiceRequest = require("../models/ServiceRequest");

const getDashboardData = async (userId) => {
  const now = new Date();

  const upcomingLimit = new Date(now);

  upcomingLimit.setDate(
    upcomingLimit.getDate() + 30
  );

  const [
    homesCount,
    assetsCount,
    documentsCount,
    maintenanceCount,
    attentionMaintenance,
    attentionReminders,
    upcomingMaintenance,
    upcomingReminders,
    homes,
    serviceRequests
  ] = await Promise.all([

    // Homes
    Home.countDocuments({
      user: userId,
    }),

    // Assets
    Asset.countDocuments({
      user: userId,
    }),

    // Documents
    Document.countDocuments({
      user: userId,
    }),

    // Upcoming maintenance
    Maintenance.countDocuments({
      user: userId,
      dueDate: {
        $gte: now,
      },
    }),

    // Overdue maintenance
    Maintenance.countDocuments({
      user: userId,
      dueDate: {
        $lt: now,
      },
    }),

    // Pending reminders requiring attention
    Reminder.countDocuments({
      user: userId,
      status: "PENDING",
      reminderDate: {
        $lte: now,
      },
    }),

    // Upcoming maintenance
    Maintenance.find({
      user: userId,
      dueDate: {
        $gte: now,
        $lte: upcomingLimit,
      },
    })
      .populate(
        "asset",
        "name"
      )
      .sort({
        dueDate: 1,
      })
      .limit(5),

    // Upcoming reminders
    Reminder.find({
      user: userId,
      status: "PENDING",
      reminderDate: {
        $gte: now,
        $lte: upcomingLimit,
      },
    })
      .populate(
        "asset",
        "name"
      )
      .sort({
        reminderDate: 1,
      })
      .limit(5),

    // Homes
    Home.find({
      user: userId,
    })
      .sort({
        createdAt: -1,
      }),
    // Recent service requests
    ServiceRequest.find({
      user: userId,
    })
      .populate("asset", "name")
      .sort({
        createdAt: -1,
      })
      .limit(5),
  ]);

  /*
   * Build home-level dashboard information.
   *
   * Home
   *  └── Assets
   *       ├── Maintenance
   *       ├── Documents
   *       └── Reminders
   */

  const homeDashboard = await Promise.all(
    homes.map(async (home) => {

      const assets = await Asset.find({
        user: userId,
        home: home._id,
      }).select("_id");

      const assetIds = assets.map(
        (asset) => asset._id
      );

      const [
        homeMaintenance,
        homeDocuments,
        homeReminders,
      ] = await Promise.all([

        Maintenance.countDocuments({
          user: userId,
          asset: {
            $in: assetIds,
          },
        }),

        Document.countDocuments({
          user: userId,
          asset: {
            $in: assetIds,
          },
        }),

        Reminder.countDocuments({
          user: userId,
          asset: {
            $in: assetIds,
          },
          status: "PENDING",
        }),
      ]);

      return {
        _id: home._id,
        name: home.name,
        type: home.type,
        address: home.address,

        assets: assets.length,

        maintenance:
          homeMaintenance,

        documents:
          homeDocuments,

        reminders:
          homeReminders,
      };
    })
  );

  /*
   * Upcoming maintenance items
   */

  const upcomingMaintenanceItems =
    upcomingMaintenance.map(
      (maintenance) => ({
        _id: maintenance._id,

        type: "MAINTENANCE",

        title:
          maintenance.title ||
          "Maintenance",

        asset:
          maintenance.asset?.name ||
          "Unknown asset",

        dueDate:
          maintenance.dueDate,
      })
    );

  /*
   * Upcoming reminders
   */

  const upcomingReminderItems =
    upcomingReminders.map(
      (reminder) => ({
        _id: reminder._id,

        type: "WARRANTY",

        title:
          reminder.type ===
            "WARRANTY_EXPIRY"
            ? "Warranty expires"
            : "Reminder",

        asset:
          reminder.asset?.name ||
          "Unknown asset",

        dueDate:
          reminder.reminderDate,
      })
    );

  /*
   * Combine upcoming items
   */

  const upcoming = [
    ...upcomingMaintenanceItems,
    ...upcomingReminderItems,
  ]
    .sort(
      (a, b) =>
        new Date(a.dueDate) -
        new Date(b.dueDate)
    )
    .slice(0, 5);

  const serviceRequestItems =
    serviceRequests.map((request) => ({
      _id: request._id,

      title:
        request.title ||
        request.serviceType ||
        "Service request",

      asset:
        request.asset?.name ||
        "Asset",

      status:
        request.status ||
        "PENDING",

      scheduledDate:
        request.scheduledDate ||
        request.serviceDate ||
        null,
    }));
  /*
   * Final dashboard response
   */

  return {
    overview: {

      homes:
        homesCount,

      assets:
        assetsCount,

      maintenance:
        maintenanceCount,

      documents:
        documentsCount,

      attention:
        attentionMaintenance +
        attentionReminders,
    },

    homes: homeDashboard,
    serviceRequests: serviceRequestItems,
    upcoming,
  };
};

module.exports = {
  getDashboardData,
};