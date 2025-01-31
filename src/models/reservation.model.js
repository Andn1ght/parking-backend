const mongoose = require("mongoose");

const ReservationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    parkingSpot: { type: mongoose.Schema.Types.ObjectId, ref: "ParkingSpot", required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    isPaid: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model("Reservation", ReservationSchema);