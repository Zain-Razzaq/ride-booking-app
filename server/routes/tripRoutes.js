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

/**
 * Trip Routes - All endpoints for trip management
 */

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Create new trip booking
router.post("/book", bookTrip);

// Retrieve user's trip history
router.get("/user", getUserTripsController);

// Retrieve driver's trip history
router.get("/driver", getDriverTripsController);

// Retrieve trips awaiting driver acceptance
router.get("/pending", getPendingTripsController);

// Retrieve currently active trips
router.get("/active", getActiveTripsController);

// Driver accepts a trip request
router.patch("/:tripId/accept", acceptTrip);

// Update trip status (in_progress, completed, cancelled)
router.patch("/:tripId/status", updateTripStatusController);

export default router;
