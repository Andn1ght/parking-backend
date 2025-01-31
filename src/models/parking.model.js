const mongoose = require("mongoose");

const ParkingSpotSchema = new mongoose.Schema({
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    location: {
        type: { type: String, enum: ["Point"], required: true },
        coordinates: { type: [Number], required: true }, // [longitude, latitude]
    },
    pricePerHour: { type: Number, required: true },
    isAvailable: { type: Boolean, default: true }
}, { timestamps: true });

ParkingSpotSchema.index({ location: "2dsphere" }); // Enables geospatial queries

module.exports = mongoose.model("ParkingSpot", ParkingSpotSchema);
