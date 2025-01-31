const User = require("../models/user.model");
const ParkingSpot = require("../models/parking.model");
const logger = require("../utils/logger");

// Get all users (Admin Only)
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password"); // Exclude passwords
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Change user role (Admin Only)
const changeUserRole = async (req, res) => {
    try {
        const { userId, role } = req.body;
        if (!["user", "admin", "owner"].includes(role)) {
            return res.status(400).json({ message: "Invalid role" });
        }

        const updatedUser = await User.findByIdAndUpdate(userId, { role }, { new: true }).select("-password");
        res.json({ message: "User role updated", updatedUser });

        // Log user role changes
        logger.info(`Admin ${req.user.id} changed user ${userId} role to ${role}`);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all parking spots (Admin Only)
const getAllParkingSpots = async (req, res) => {
    try {
        const parkingSpots = await ParkingSpot.find().populate("owner", "username email");
        res.json(parkingSpots);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete parking spot (Admin Only)
const deleteParkingSpotByAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const parkingSpot = await ParkingSpot.findById(id);

        if (!parkingSpot) {
            return res.status(404).json({ message: "Parking spot not found" });
        }

        await ParkingSpot.findByIdAndDelete(id);
        res.json({ message: "Parking spot deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getAllUsers, changeUserRole, getAllParkingSpots, deleteParkingSpotByAdmin };