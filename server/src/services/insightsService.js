const Asset = require("../models/Asset");
const Maintenance = require("../models/Maintenance");
const ServiceHistory = require("../models/ServiceHistory");

const getInsightsData = async (userId) => {
    const now = new Date();

    const [
        assets,
        maintenance,
        serviceHistory,
    ] = await Promise.all([
        Asset.find({
            user: userId,
        }).populate(
            "home",
            "name"
        ),

        Maintenance.find({
            user: userId,
        }).populate(
            "asset",
            "name category home"
        ),

        ServiceHistory.find({
            user: userId,
        }).populate({
            path: "asset",
            select: "name category home",
            populate: {
                path: "home",
                select: "name",
            },
        }),
    ]);

    /*
    |--------------------------------------------------------------------------
    | 1. TOTAL ASSET VALUE
    |--------------------------------------------------------------------------
    */

    const totalAssetValue = assets.reduce(
        (total, asset) =>
            total +
            Number(asset.purchasePrice || 0),
        0
    );


    /*
    |--------------------------------------------------------------------------
    | 2. TOTAL SERVICE COST
    |--------------------------------------------------------------------------
    */

    const totalServiceCost =
        serviceHistory.reduce(
            (total, service) =>
                total +
                Number(service.cost || 0),
            0
        );


    /*
    |--------------------------------------------------------------------------
    | 3. UPCOMING MAINTENANCE
    |--------------------------------------------------------------------------
    */

    const upcomingMaintenance =
        maintenance.filter(
            (item) =>
                item.dueDate &&
                new Date(item.dueDate) >= now
        );


    const totalMaintenanceCost =
        upcomingMaintenance.reduce(
            (total, item) =>
                total +
                Number(
                    item.estimatedCost || 0
                ),
            0
        );


    /*
    |--------------------------------------------------------------------------
    | 4. TOTAL OWNERSHIP COST
    |--------------------------------------------------------------------------
    */

    const totalOwnershipCost =
        totalAssetValue +
        totalServiceCost;


    /*
    |--------------------------------------------------------------------------
    | 5. SPENDING BY CATEGORY
    |--------------------------------------------------------------------------
    |
    | Purchase price + service cost
    |
    */

    const categoryMap = {};

    assets.forEach((asset) => {
        const category =
            asset.category || "Other";

        if (!categoryMap[category]) {
            categoryMap[category] = 0;
        }

        categoryMap[category] +=
            Number(
                asset.purchasePrice || 0
            );
    });

    serviceHistory.forEach((service) => {
        const category =
            service.asset?.category ||
            "Other";

        if (!categoryMap[category]) {
            categoryMap[category] = 0;
        }

        categoryMap[category] +=
            Number(service.cost || 0);
    });

    const spendingByCategory =
        Object.entries(categoryMap)
            .map(
                ([category, amount]) => ({
                    category,
                    amount,
                })
            )
            .sort(
                (a, b) =>
                    b.amount - a.amount
            );


    /*
    |--------------------------------------------------------------------------
    | 6. SPENDING BY HOME
    |--------------------------------------------------------------------------
    |
    | Asset purchase price + service cost
    |
    */

    const homeMap = {};

    assets.forEach((asset) => {
        const homeName =
            asset.home?.name ||
            "Unassigned";

        if (!homeMap[homeName]) {
            homeMap[homeName] = 0;
        }

        homeMap[homeName] +=
            Number(
                asset.purchasePrice || 0
            );
    });

    serviceHistory.forEach((service) => {
        const homeName =
            service.asset?.home?.name ||
            "Unassigned";

        if (!homeMap[homeName]) {
            homeMap[homeName] = 0;
        }

        homeMap[homeName] +=
            Number(service.cost || 0);
    });

    const spendingByHome =
        Object.entries(homeMap)
            .map(
                ([home, amount]) => ({
                    home,
                    amount,
                })
            )
            .sort(
                (a, b) =>
                    b.amount - a.amount
            );


    /*
    |--------------------------------------------------------------------------
    | 7. ASSET OWNERSHIP COST
    |--------------------------------------------------------------------------
    */

    const assetMap = {};

    assets.forEach((asset) => {
        assetMap[
            asset._id.toString()
        ] = {
            assetId: asset._id,
            asset: asset.name,
            category:
                asset.category ||
                "Other",
            home:
                asset.home?.name ||
                "Unassigned",
            purchaseCost:
                Number(
                    asset.purchasePrice || 0
                ),
            serviceCost: 0,
            totalCost:
                Number(
                    asset.purchasePrice || 0
                ),
            serviceCount: 0,
        };
    });

    serviceHistory.forEach((service) => {
        const assetId =
            service.asset?._id?.toString();

        if (!assetId) {
            return;
        }

        if (!assetMap[assetId]) {
            return;
        }

        const cost =
            Number(service.cost || 0);

        assetMap[assetId].serviceCost +=
            cost;

        assetMap[assetId].totalCost +=
            cost;

        assetMap[assetId].serviceCount +=
            1;
    });

    const assetOwnership =
        Object.values(assetMap)
            .sort(
                (a, b) =>
                    b.totalCost -
                    a.totalCost
            );


    /*
    |--------------------------------------------------------------------------
    | 8. MONTHLY SPENDING
    |--------------------------------------------------------------------------
    |
    | Asset purchases + service costs
    |
    */

    const monthlyMap = {};

    const addMonthlyAmount = (
        date,
        amount
    ) => {
        if (!date) {
            return;
        }

        const parsedDate =
            new Date(date);

        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {
            return;
        }

        const year =
            parsedDate.getFullYear();

        const month =
            String(
                parsedDate.getMonth() + 1
            ).padStart(2, "0");

        const key =
            `${year}-${month}`;

        if (!monthlyMap[key]) {
            monthlyMap[key] = 0;
        }

        monthlyMap[key] +=
            Number(amount || 0);
    };


    assets.forEach((asset) => {
        addMonthlyAmount(
            asset.purchaseDate,
            asset.purchasePrice
        );
    });


    serviceHistory.forEach((service) => {
        addMonthlyAmount(
            service.serviceDate,
            service.cost
        );
    });


    const monthlySpending =
        Object.entries(monthlyMap)
            .map(
                ([month, amount]) => ({
                    month,
                    amount,
                })
            )
            .sort(
                (a, b) =>
                    a.month.localeCompare(
                        b.month
                    )
            );


    /*
    |--------------------------------------------------------------------------
    | RETURN
    |--------------------------------------------------------------------------
    */

    return {
        overview: {
            totalAssetValue,
            totalServiceCost,
            totalMaintenanceCost,
            totalOwnershipCost,
        },

        upcoming: {
            maintenanceCount:
                upcomingMaintenance.length,

            estimatedCost:
                totalMaintenanceCost,
        },

        spendingByCategory,

        spendingByHome,

        assetOwnership,

        monthlySpending,
    };
};

module.exports = {
    getInsightsData,
};