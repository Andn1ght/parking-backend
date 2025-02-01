const express = require("express");
const { createParkingSpot, getAllParkingSpots, getNearbyParkingSpots, updateParkingSpot, deleteParkingSpot } = require("../controllers/parking.controller");
const { authenticateUser, authorizeRoles } = require("../middleware/auth.middleware");

const router = express.Router();

// Routes
router.post("/", authenticateUser, authorizeRoles(["admin", "owner"]), createParkingSpot);
router.get("/", getAllParkingSpots); // ✅ New Route
router.get("/nearby", getNearbyParkingSpots);
router.put("/:id", authenticateUser, authorizeRoles(["admin", "owner"]), updateParkingSpot);
router.delete("/:id", authenticateUser, authorizeRoles(["admin", "owner"]), deleteParkingSpot);

module.exports = router;
