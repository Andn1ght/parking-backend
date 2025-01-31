const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Payment = require("../models/payment.model");
const Reservation = require("../models/reservation.model");

// Create a payment session
const createPaymentSession = async (req, res) => {
    try {
        const { reservationId } = req.body;

        const reservation = await Reservation.findById(reservationId).populate("parkingSpot");
        if (!reservation) {
            return res.status(404).json({ message: "Reservation not found" });
        }

        const price = reservation.parkingSpot.pricePerHour * ((new Date(reservation.endTime) - new Date(reservation.startTime)) / 3600000);

        const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [{
                price_data: {
                    currency: "usd",
                    product_data: { name: reservation.parkingSpot.name },
                    unit_amount: Math.round(price * 100)
                },
                quantity: 1
            }],
            mode: "payment",
            success_url: `${clientUrl}/payment-success`,
            cancel_url: `${clientUrl}/payment-failed`
        });

        const payment = new Payment({
            user: req.user.id,
            reservation: reservationId,
            amount: price,
            stripeSessionId: session.id
        });

        await payment.save();

        res.json({ sessionId: session.id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Verify payment completion
const verifyPayment = async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.retrieve(req.body.sessionId);

        if (!session) {
            return res.status(400).json({ message: "Invalid session ID" });
        }

        const payment = await Payment.findOne({ stripeSessionId: session.id });
        if (!payment) {
            return res.status(404).json({ message: "Payment record not found" });
        }

        if (session.payment_status === "paid") {
            payment.status = "completed";
            await payment.save();

            await Reservation.findByIdAndUpdate(payment.reservation, { isPaid: true });

            res.json({ message: "Payment verified successfully", payment });
        } else {
            res.status(400).json({ message: "Payment not completed" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { createPaymentSession, verifyPayment };