const express = require("express");
const { createReservation, getUserReservations, getAllReservations, cancelReservation } = require("../controllers/reservation.controller");
const { authenticateUser, authorizeRoles } = require("../middleware/auth.middleware");

const router = express.Router();

// Routes
router.post("/", authenticateUser, createReservation);  // Users book a parking spot
router.get("/", authenticateUser, getUserReservations); // Users view their reservations
router.get("/all", authenticateUser, authorizeRoles(["admin"]), getAllReservations); // Admins view all reservations
router.delete("/:id", authenticateUser, cancelReservation); // Users/Admins cancel reservations

module.exports = router;