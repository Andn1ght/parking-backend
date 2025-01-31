const express = require("express");
const Regulation = require("../models/regs.model");

const router = express.Router();

/**
 * @swagger
 * /api/regs:
 *   get:
 *     summary: Get all street regulations
 *     tags: [Regulations]
 *     responses:
 *       200:
 *         description: List of all NYC street regulations
 */
router.get("/", async (req, res, next) => {
  try {
    const regs = await Regulation.find();
    res.json(regs);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/regs:
 *   post:
 *     summary: Add a new street regulation
 *     tags: [Regulations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *               properties:
 *                 type: object
 *               geometry:
 *                 type: object
 *     responses:
 *       201:
 *         description: Regulation created
 */
router.post("/", async (req, res, next) => {
  try {
    const newReg = new Regulation(req.body);
    const savedReg = await newReg.save();
    res.status(201).json(savedReg);
  } catch (error) {
    res.status(422).json({ message: "Validation error", error });
  }
});

module.exports = router;