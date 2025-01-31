const express = require("express");
const { getAllUsers, changeUserRole, getAllParkingSpots, deleteParkingSpotByAdmin } = require("../controllers/admin.controller");
const { authenticateUser, authorizeRoles } = require("../middleware/auth.middleware");

const router = express.Router();

// Admin Routes
router.get("/users", authenticateUser, authorizeRoles(["admin"]), getAllUsers);
router.put("/users/role", authenticateUser, authorizeRoles(["admin"]), changeUserRole);
router.get("/parking", authenticateUser, authorizeRoles(["admin"]), getAllParkingSpots);
router.delete("/parking/:id", authenticateUser, authorizeRoles(["admin"]), deleteParkingSpotByAdmin);

module.exports = router;