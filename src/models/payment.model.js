const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reservation: { type: mongoose.Schema.Types.ObjectId, ref: "Reservation", required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "usd" },
    status: { type: String, enum: ["pending", "completed", "failed"], default: "pending" },
    stripeSessionId: { type: String }
}, { timestamps: true });

module.exports = mongoose.model("Payment", PaymentSchema);