const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Payment = require("../models/payment.model");
const Reservation = require("../models/reservation.model");

// Create a payment session
const createPaymentSession = async (req, res) => {
    try {
        const { reservationId } = req.body;

        // Find reservation and related parking spot
        const reservation = await Reservation.findById(reservationId).populate("parkingSpot");
        if (!reservation) {
            return res.status(404).json({ message: "Reservation not found" });
        }

        // Ensure price is valid
        const hours = (new Date(reservation.endTime) - new Date(reservation.startTime)) / 3600000;
        const price = reservation.parkingSpot.pricePerHour * hours;

        if (isNaN(price) || price <= 0) {
            return res.status(400).json({ message: "Invalid total price" });
        }

        // Define frontend URL for success & cancel redirections
        const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";

        // ✅ Declare session inside try block
        let session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [{
                price_data: {
                    currency: "usd",
                    product_data: { name: reservation.parkingSpot.name },
                    unit_amount: Math.round(price * 100) // Convert to cents
                },
                quantity: 1
            }],
            mode: "payment",
            success_url: `${clientUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${clientUrl}/payment-failed`
        });

        // ✅ Ensure session exists before using it
        if (!session || !session.id) {
            return res.status(500).json({ error: "Failed to create Stripe session" });
        }

        // Save payment details in the database
        const payment = new Payment({
            user: req.user.id,
            reservation: reservationId,
            amount: price,
            stripeSessionId: session.id
        });
        await payment.save();

        // ✅ Return full Stripe Checkout URL
        res.json({ checkoutUrl: session.url });

    } catch (error) {
        console.error("❌ Error creating Stripe session:", error);
        res.status(500).json({ error: error.message });
    }
};

// Verify payment completion
const verifyPayment = async (req, res) => {
    try {
        const { session_id } = req.query; // Extract session ID from frontend redirect URL

        if (!session_id) {
            return res.status(400).json({ message: "Session ID is required" });
        }

        // Retrieve session details from Stripe
        const session = await stripe.checkout.sessions.retrieve(session_id);
        if (!session) {
            return res.status(400).json({ message: "Invalid session ID" });
        }

        // Find payment record in database
        const payment = await Payment.findOne({ stripeSessionId: session.id }).populate("reservation");
        if (!payment) {
            return res.status(404).json({ message: "Payment record not found" });
        }

        // Check if payment is already completed
        if (payment.status === "completed") {
            return res.json({ message: "Payment already verified", payment });
        }

        // ✅ Mark payment as completed if Stripe session is successful
        if (session.payment_status === "paid") {
            payment.status = "completed";
            await payment.save();

            // ✅ Update reservation status to "paid"
            await Reservation.findByIdAndUpdate(payment.reservation._id, { isPaid: true });

            return res.json({ message: "Payment verified successfully", payment });
        } else {
            return res.status(400).json({ message: "Payment not completed" });
        }
    } catch (error) {
        console.error("❌ Error verifying payment:", error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = { createPaymentSession, verifyPayment };