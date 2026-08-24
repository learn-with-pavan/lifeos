const ServiceProvider = require("../models/ServiceProvider");
const Asset = require("../models/Asset");


const findProvidersForAsset = async (
    userId,
    assetId,
    longitude,
    latitude
) => {

    // 1. Validate customer coordinates
    const customerLongitude = Number(longitude);
    const customerLatitude = Number(latitude);

    if (!Number.isFinite(customerLongitude) || !Number.isFinite(customerLatitude)) {
        const error = new Error("Valid customer latitude and longitude are required.");
        error.statusCode = 400;
        throw error;
    }


    if (customerLatitude < -90 || customerLatitude > 90) {
        const error = new Error("Invalid customer latitude.");
        error.statusCode = 400;
        throw error;
    }


    if (customerLongitude < -180 || customerLongitude > 180) {
        const error = new Error("Invalid customer longitude.");
        error.statusCode = 400;
        throw error;
    }


    // 2. Get customer's asset
    const asset = await Asset.findOne({ _id: assetId, user: userId });
    if (!asset) {
        const error = new Error("Asset not found.");
        error.statusCode = 404;
        throw error;
    }


    const assetCategory =
        String(
            asset.category || ""
        ).trim();


    if (!assetCategory) {

        const error =
            new Error(
                "Asset category is required to find technicians."
            );

        error.statusCode = 400;

        throw error;
    }


    /*
     * ---------------------------------------------------------
     * 3. Find geographically nearby providers
     *
     * MongoDB expects:
     *
     * [longitude, latitude]
     *
     * distanceField is returned in meters.
     * ---------------------------------------------------------
     */

    const providers =
        await ServiceProvider.aggregate([

            {
                $geoNear: {

                    near: {
                        type: "Point",

                        coordinates: [
                            customerLongitude,
                            customerLatitude,
                        ],
                    },

                    key:
                        "location",

                    distanceField:
                        "distanceFromCustomerMeters",

                    spherical:
                        true,

                    distanceMultiplier:
                        1,

                    query: {

                        verificationStatus:
                            "VERIFIED",

                        isActive:
                            true,

                        availability:
                            "AVAILABLE",

                        supportedCategories: {
                            $regex:
                                `^${assetCategory.replace(
                                    /[.*+?^${}()|[\]\\]/g,
                                    "\\$&"
                                )}$`,

                            $options:
                                "i",
                        },

                        "location.coordinates": {
                            $exists: true,

                            $ne: [
                                0,
                                0,
                            ],
                        },
                    },
                },
            },


            /*
             * -------------------------------------------------
             * 4. Convert meters → kilometers
             * -------------------------------------------------
             */

            {
                $addFields: {

                    distanceKm: {
                        $divide: [
                            "$distanceFromCustomerMeters",
                            1000,
                        ],
                    },

                },
            },


            /*
             * -------------------------------------------------
             * 5. Respect provider's service radius
             *
             * Example:
             *
             * Provider A → 5 km radius
             * Provider B → 15 km radius
             *
             * Customer is 8 km away:
             *
             * A → excluded
             * B → included
             * -------------------------------------------------
             */

            {
                $match: {

                    $expr: {

                        $lte: [
                            "$distanceKm",
                            "$serviceRadiusKm",
                        ],

                    },

                },
            },


            /*
             * -------------------------------------------------
             * 6. Return only fields customer needs
             * -------------------------------------------------
             */

            {
                $project: {

                    _id: 1,

                    businessName: 1,

                    description: 1,

                    services: 1,

                    supportedCategories: 1,

                    experienceYears: 1,

                    availability: 1,

                    rating: 1,

                    serviceRadiusKm: 1,

                    location: {

                        city:
                            "$location.city",

                        state:
                            "$location.state",

                    },

                    distanceKm: {

                        $round: [
                            "$distanceKm",
                            1,
                        ],

                    },

                },

            },


            /*
             * -------------------------------------------------
             * 7. Nearest provider first
             * -------------------------------------------------
             */

            {
                $sort: {
                    distanceKm: 1,
                },
            },

        ]);


    /*
     * ---------------------------------------------------------
     * 8. Logging
     * ---------------------------------------------------------
     */

    console.log(
        "Provider discovery",
        {
            asset:
                asset.name,

            assetCategory,

            customerLocation: {
                longitude:
                    customerLongitude,

                latitude:
                    customerLatitude,
            },

            matchingCount:
                providers.length,
        }
    );


    /*
     * ---------------------------------------------------------
     * 9. Response
     * ---------------------------------------------------------
     */

    return {

        asset: {

            _id:
                asset._id,

            name:
                asset.name,

            category:
                asset.category,

        },

        customerLocation: {

            longitude:
                customerLongitude,

            latitude:
                customerLatitude,

        },

        providers,

    };
};


module.exports = {
    findProvidersForAsset,
};