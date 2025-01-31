const express = require("express");
const { createPaymentSession, verifyPayment } = require("../controllers/payment.controller");
const { authenticateUser } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/create-session", authenticateUser, createPaymentSession);
router.post("/verify", authenticateUser, verifyPayment);

module.exports = router;