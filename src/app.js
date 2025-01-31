require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const xss = require("xss-clean");
const hpp = require("hpp");
const expressWinston = require("express-winston");
const logger = require("./utils/logger");
const { apiLimiter } = require("./middleware/rateLimit.middleware");
const setupSwagger = require("./config/swagger.config");

// Import Routes
const authRoutes = require("./api/auth.routes");
const parkingRoutes = require("./api/parking.routes");
const reservationRoutes = require("./api/reservation.routes");
const paymentRoutes = require("./api/payment.routes");
const adminRoutes = require("./api/admin.routes");
const meterRoutes = require("./api/meters.routes");
const regulationRoutes = require("./api/regs.routes");

// Initialize Express App
const app = express();

// Middleware
app.use(express.json());  // Parse JSON request bodies
app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:3000" })); // Enable CORS
app.use(helmet()); // Security headers
app.use(xss()); // Prevent XSS attacks
app.use(hpp()); // Prevent HTTP Parameter Pollution
app.use(morgan("dev")); // Request logging

// Apply Rate Limiting to All API Routes
app.use("/api", apiLimiter);

// Logging API Requests
app.use(expressWinston.logger({
    winstonInstance: logger,
    meta: true,
    msg: "HTTP {{req.method}} {{req.url}}",
    colorize: false,
}));

// Register Routes
app.use("/api/auth", authRoutes);
app.use("/api/parking", parkingRoutes);
app.use("/api/reservation", reservationRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/meters", meterRoutes);
app.use("/api/regs", regulationRoutes);

// Error Logging
app.use(expressWinston.errorLogger({
    winstonInstance: logger
}));

// Initialize Swagger
setupSwagger(app);

// Default route
app.get("/", (req, res) => {
    res.json({ message: "API is running!" });
});

// Error Handling Middleware
app.use((req, res, next) => res.status(404).json({ message: "Not Found" }));
app.use((error, req, res, next) => {
    res.status(error.status || 500).json({ message: error.message || "Internal Server Error" });
});

module.exports = app;