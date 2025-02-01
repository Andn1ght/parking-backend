const ParkingSpot = require("../models/parking.model");

// ✅ Create a new parking spot (Only for Admins/Owners)
const createParkingSpot = async (req, res) => {
    try {
        const { name, coordinates, pricePerHour } = req.body;

        if (!coordinates || coordinates.length !== 2) {
            return res.status(400).json({ message: "Invalid coordinates format" });
        }

        const parkingSpot = new ParkingSpot({
            owner: req.user.id, // From JWT token
            name,
            location: { type: "Point", coordinates },
            pricePerHour
        });

        await parkingSpot.save();
        res.status(201).json({ message: "Parking spot created successfully", parkingSpot });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ Get all parking spots
const getAllParkingSpots = async (req, res) => {
    try {
        const parkingSpots = await ParkingSpot.find();
        res.status(200).json(parkingSpots);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ Get all nearby parking spots
const getNearbyParkingSpots = async (req, res) => {
    try {
        const { longitude, latitude, maxDistance = 5000 } = req.query;

        if (!longitude || !latitude) {
            return res.status(400).json({ message: "Longitude and latitude are required" });
        }

        const spots = await ParkingSpot.find({
            location: {
                $near: {
                    $geometry: { type: "Point", coordinates: [parseFloat(longitude), parseFloat(latitude)] },
                    $maxDistance: parseInt(maxDistance)
                }
            },
            isAvailable: true
        });

        res.json(spots);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ Update a parking spot (Only for Admins/Owners)
const updateParkingSpot = async (req, res) => {
    try {
        const { id } = req.params;
        const parkingSpot = await ParkingSpot.findById(id);

        if (!parkingSpot) {
            return res.status(404).json({ message: "Parking spot not found" });
        }

        if (parkingSpot.owner.toString() !== req.user.id && req.user.role !== "admin") {
            return res.status(403).json({ message: "Unauthorized" });
        }

        const updatedSpot = await ParkingSpot.findByIdAndUpdate(id, req.body, { new: true });
        res.json({ message: "Parking spot updated", updatedSpot });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ Delete a parking spot (Only for Admins/Owners)
const deleteParkingSpot = async (req, res) => {
    try {
        const { id } = req.params;
        const parkingSpot = await ParkingSpot.findById(id);

        if (!parkingSpot) {
            return res.status(404).json({ message: "Parking spot not found" });
        }

        if (parkingSpot.owner.toString() !== req.user.id && req.user.role !== "admin") {
            return res.status(403).json({ message: "Unauthorized" });
        }

        await ParkingSpot.findByIdAndDelete(id);
        res.json({ message: "Parking spot deleted" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { createParkingSpot, getAllParkingSpots, getNearbyParkingSpots, updateParkingSpot, deleteParkingSpot };