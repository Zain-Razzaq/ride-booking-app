import express from "express";
import {
  bookTrip,
  getUserTripsController,
  getDriverTripsController,
  getPendingTripsController,
  getActiveTripsController,
  acceptTrip,
  updateTripStatusController,
} from "../controllers/tripController.js";
import { verifyToken } from "../controllers/authController.js";

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Book a new trip
router.post("/book", bookTrip);

// Get user's trips
router.get("/user", getUserTripsController);

// Get driver's trips
router.get("/driver", getDriverTripsController);

// Get pending trips (for drivers)
router.get("/pending", getPendingTripsController);

// Get active trips
router.get("/active", getActiveTripsController);

// Accept a trip (driver only)
router.patch("/:tripId/accept", acceptTrip);

// Update trip status
router.patch("/:tripId/status", updateTripStatusController);

export default router;
