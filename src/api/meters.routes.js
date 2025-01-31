const express = require("express");
const { getAllMeters } = require("../controllers/meters.controller");

const router = express.Router();

/**
 * @swagger
 * /api/meters:
 *   get:
 *     summary: Get all parking meters
 *     tags: [Meters]
 *     responses:
 *       200:
 *         description: List of all NYC parking meters
 */
router.get("/", getAllMeters);

module.exports = router;
