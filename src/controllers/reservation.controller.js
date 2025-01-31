const Reservation = require("../models/reservation.model");
const ParkingSpot = require("../models/parking.model");
const logger = require("../utils/logger");

// Book a parking spot
const createReservation = async (req, res) => {
    try {
        const { parkingSpotId, startTime, endTime } = req.body;

        // Check if the spot exists
        const parkingSpot = await ParkingSpot.findById(parkingSpotId);
        if (!parkingSpot) {
            return res.status(400).json({ message: "Parking spot does not exist" });
        }

        // Check for conflicting reservations
        const existingReservations = await Reservation.find({
            parkingSpot: parkingSpotId,
            $or: [
                { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
            ]
        });

        if (existingReservations.length > 0) {
            return res.status(400).json({ message: "Parking spot is already reserved for this time" });
        }

        // Create reservation
        const reservation = new Reservation({
            user: req.user.id,
            parkingSpot: parkingSpotId,
            startTime,
            endTime
        });

        await reservation.save();

        // Check if the parking spot is fully booked for the entire day
        const allDayReservations = await Reservation.find({
            parkingSpot: parkingSpotId,
            startTime: { $gte: new Date().setHours(0, 0, 0, 0) },
            endTime: { $lte: new Date().setHours(23, 59, 59, 999) }
        });

        if (allDayReservations.length > 0) {
            await ParkingSpot.findByIdAndUpdate(parkingSpotId, { isAvailable: false });
        }

        res.status(201).json({ message: "Reservation created successfully", reservation });

        // Log reservation creation
        logger.info(`User ${req.user.id} reserved spot ${parkingSpotId} from ${startTime} to ${endTime}`);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get user reservations
const getUserReservations = async (req, res) => {
    try {
        const reservations = await Reservation.find({ user: req.user.id })
            .populate("parkingSpot", "name location pricePerHour");

        res.json(reservations);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all reservations (Admin only)
const getAllReservations = async (req, res) => {
    try {
        const reservations = await Reservation.find()
            .populate("user", "username email")
            .populate("parkingSpot", "name location pricePerHour");

        res.json(reservations);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Cancel reservation (Only the user who booked or Admin)
const cancelReservation = async (req, res) => {
    try {
        const { id } = req.params;
        const reservation = await Reservation.findById(id);

        if (!reservation) {
            return res.status(404).json({ message: "Reservation not found" });
        }

        if (reservation.user.toString() !== req.user.id && req.user.role !== "admin") {
            return res.status(403).json({ message: "Unauthorized" });
        }

        const parkingSpotId = reservation.parkingSpot;

        await Reservation.findByIdAndDelete(id);

        // Check if there are remaining reservations for this spot
        const remainingReservations = await Reservation.find({ parkingSpot: parkingSpotId });

        if (remainingReservations.length === 0) {
            await ParkingSpot.findByIdAndUpdate(parkingSpotId, { isAvailable: true });
        }

        res.json({ message: "Reservation canceled successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { createReservation, getUserReservations, getAllReservations, cancelReservation };