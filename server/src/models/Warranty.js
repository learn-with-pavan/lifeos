const mongoose = require("mongoose");

const warrantySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    asset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Asset",
      required: true,
    },

    provider: {
      type: String,
      trim: true,
    },

    warrantyType: {
      type: String,
      enum: [
        "Manufacturer",
        "Extended",
        "Seller",
        "Other",
      ],
      default: "Manufacturer",
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

warrantySchema.index({ endDate: 1 });

const Warranty = mongoose.model(
  "Warranty",
  warrantySchema
);

module.exports = Warranty;