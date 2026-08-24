const mongoose = require("mongoose");

const serviceProviderSchema = new mongoose.Schema(
    {
        /*
         * Provider account owner
         *
         * A provider is also a LifeOS user.
         */
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
            index: true,
        },

        /*
         * Provider / business information
         */
        businessName: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            trim: true,
            default: "",
        },

        phone: {
            type: String,
            trim: true,
            default: "",
        },

        email: {
            type: String,
            trim: true,
            lowercase: true,
            default: "",
        },

        /*
         * Services offered
         *
         * Example:
         * ["AC_REPAIR", "AC_SERVICE"]
         */
        services: {
            type: [String],
            default: [],
        },

        /*
         * Asset categories supported by provider
         *
         * Example:
         * ["Appliance", "Electronics"]
         */
        supportedCategories: {
            type: [String],
            default: [],
            index: true,
        },

        /*
         * Service location
         *
         * GeoJSON Point:
         * [longitude, latitude]
         *
         * Used later for nearby-provider search.
         */
        location: {
            type: {
                type: String,
                enum: ["Point"],
                default: "Point",
            },

            coordinates: {
                type: [Number]
            },

            address: {
                type: String,
                trim: true,
                default: "",
            },

            city: {
                type: String,
                trim: true,
                default: "",
            },

            state: {
                type: String,
                trim: true,
                default: "",
            },

            country: {
                type: String,
                trim: true,
                default: "India",
            },

            pincode: {
                type: String,
                trim: true,
                default: "",
            },
        },

        /*
         * Maximum distance the provider is
         * willing to travel for a service.
         */
        serviceRadiusKm: {
            type: Number,
            min: 0,
            default: 10,
        },

        /*
         * Experience
         */
        experienceYears: {
            type: Number,
            min: 0,
            default: 0,
        },

        /*
         * Provider availability
         *
         * We will build the actual availability
         * management later.
         */
        availability: {
            type: String,
            enum: [
                "AVAILABLE",
                "BUSY",
                "UNAVAILABLE",
            ],
            default: "AVAILABLE",
        },

        /*
         * Provider verification
         *
         * Verification workflow will be
         * implemented later.
         */
        verificationStatus: {
            type: String,
            enum: [
                "PENDING",
                "VERIFIED",
                "REJECTED",
            ],
            default: "PENDING",
            index: true,
        },

        /*
         * Whether provider can receive
         * service requests.
         */
        isActive: {
            type: Boolean,
            default: false,
            index: true,
        },

        settings: {
            notifications: {
                serviceRequests: {
                    type: Boolean,
                    default: true,
                },

                appointmentReminders: {
                    type: Boolean,
                    default: true,
                },

                serviceUpdates: {
                    type: Boolean,
                    default: true,
                },
            },

            requestPreferences: {
                autoAcceptRequests: {
                    type: Boolean,
                    default: false,
                },
            },
        },

        /*
         * Rating summary
         *
         * Actual reviews will be implemented
         * later.
         */
        rating: {
            average: {
                type: Number,
                min: 0,
                max: 5,
                default: 0,
            },

            count: {
                type: Number,
                min: 0,
                default: 0,
            },
        },
    },
    {
        timestamps: true,
    }
);

/*
 * Geospatial index
 *
 * This will allow us later to find:
 *
 * "Technicians near this customer"
 */
serviceProviderSchema.index({
    location: "2dsphere",
});

serviceProviderSchema.index({
    supportedCategories: 1,
    verificationStatus: 1,
    isActive: 1,
    availability: 1,
});

module.exports = mongoose.model(
    "ServiceProvider",
    serviceProviderSchema
);