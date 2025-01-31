const Meter = require("../models/meters.model");

const getAllMeters = async (req, res, next) => {
    try {
        const meters = await Meter.find();
        res.json(meters);
    } catch (error) {
        next(error);
    }
};

module.exports = { getAllMeters };