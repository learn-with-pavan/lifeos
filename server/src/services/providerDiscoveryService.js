const ServiceProvider = require("../models/ServiceProvider");
const Asset = require("../models/Asset");

const findProvidersForAsset = async (
    userId,
    assetId,
    longitude,
    latitude
) => {

    const asset = await Asset.findOne({
        _id: assetId,
        user: userId,
    });

    if (!asset) {
        const error = new Error(
            "Asset not found"
        );

        error.statusCode = 404;

        throw error;
    }

    const assetCategory = String(
        asset.category || ""
    ).trim();

    const providers =
        await ServiceProvider.find({
            verificationStatus: "VERIFIED",
            isActive: true,
            availability: "AVAILABLE",

            supportedCategories: {
                $regex: `^${assetCategory.replace(
                    /[.*+?^${}()|[\]\\]/g,
                    "\\$&"
                )}$`,
                $options: "i",
            },

            "location.coordinates": {
                $exists: true,
            },
        })
            .select(
                "businessName description phone email services supportedCategories location serviceRadiusKm experienceYears availability rating"
            )
            .lean();

    /*
     * Calculate distance from customer
     * to each provider.
     *
     * MongoDB stores coordinates as:
     *
     * [longitude, latitude]
     */

    const EARTH_RADIUS_KM = 6371;


    const calculateDistance = (
        providerLongitude,
        providerLatitude
    ) => {

        const customerLat =
            Number(latitude) *
            Math.PI / 180;

        const customerLon =
            Number(longitude) *
            Math.PI / 180;

        const providerLatRad =
            Number(providerLatitude) *
            Math.PI / 180;

        const providerLonRad =
            Number(providerLongitude) *
            Math.PI / 180;


        const deltaLat =
            providerLatRad -
            customerLat;

        const deltaLon =
            providerLonRad -
            customerLon;


        const a =
            Math.sin(deltaLat / 2) *
            Math.sin(deltaLat / 2) +

            Math.cos(customerLat) *
            Math.cos(providerLatRad) *
            Math.sin(deltaLon / 2) *
            Math.sin(deltaLon / 2);


        const c =
            2 *
            Math.atan2(
                Math.sqrt(a),
                Math.sqrt(1 - a)
            );


        return EARTH_RADIUS_KM * c;
    };


    const matchingProviders =
        providers
            .map((provider) => {

                const coordinates =
                    provider.location
                        ?.coordinates || [];

                const providerLongitude =
                    coordinates[0];

                const providerLatitude =
                    coordinates[1];


                if (
                    typeof providerLongitude !==
                    "number" ||
                    typeof providerLatitude !==
                    "number"
                ) {
                    console.warn(
                        "Provider excluded: invalid coordinates",
                        provider._id,
                        provider.businessName,
                        coordinates
                    );

                    return null;
                }


                const distance =
                    calculateDistance(
                        providerLongitude,
                        providerLatitude
                    );


                /*
                 * Provider's own service radius.
                 */
                if (
                    distance >
                    provider.serviceRadiusKm
                ) {
                    console.log(
                        "Provider excluded: outside service radius",
                        {
                            provider: provider.businessName,
                            distanceKm: Number(distance.toFixed(1)),
                            serviceRadiusKm: provider.serviceRadiusKm,
                            customerLocation: {
                                longitude,
                                latitude,
                            },
                        }
                    );

                    return null;
                }


                return {
                    _id:
                        provider._id,

                    businessName:
                        provider.businessName,

                    description:
                        provider.description,

                    services:
                        provider.services,

                    supportedCategories:
                        provider.supportedCategories,

                    experienceYears:
                        provider.experienceYears,

                    availability:
                        provider.availability,

                    rating:
                        provider.rating,

                    location: {
                        city:
                            provider.location?.city ||
                            "",

                        state:
                            provider.location?.state ||
                            "",
                    },

                    serviceRadiusKm:
                        provider.serviceRadiusKm,

                    distanceKm:
                        Number(
                            distance.toFixed(1)
                        ),
                };
            })
            .filter(Boolean)
            .sort(
                (a, b) =>
                    a.distanceKm -
                    b.distanceKm
            );

    console.log("Provider discovery", {
        asset: asset.name,
        assetCategory,
        candidateCount: providers.length,
        matchingCount: matchingProviders.length,
        customerLocation: {
            longitude,
            latitude,
        },
    });
    return {
        asset: {
            _id: asset._id,
            name: asset.name,
            category: asset.category,
        },

        customerLocation: {
            longitude:
                Number(longitude),

            latitude:
                Number(latitude),
        },

        providers:
            matchingProviders,
    };
};


module.exports = {
    findProvidersForAsset,
};