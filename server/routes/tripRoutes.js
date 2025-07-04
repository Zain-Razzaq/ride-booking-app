import express from "express";
import {
  bookTrip,
  getUserTrips,
  getDriverTrips,
  acceptTrip,
  updateTripStatus,
  getPendingTrips,
  getActiveTrips,
} from "../controllers/tripController.js";
import { verifyToken } from "../controllers/authController.js";

const router = express.Router();

// Apply auth middleware to all routes
router.use(verifyToken);

// POST /api/trips/book - Book a new trip
router.post("/book", bookTrip);

// GET /api/trips/user - Get user's trips
router.get("/user", getUserTrips);

// GET /api/trips/driver - Get driver's trips
router.get("/driver", getDriverTrips);

// GET /api/trips/pending - Get all pending trips (for drivers)
router.get("/pending", getPendingTrips);

// GET /api/trips/active - Get active trips
router.get("/active", getActiveTrips);

// PUT /api/trips/:tripId/accept - Accept a trip (drivers only)
router.put("/:tripId/accept", acceptTrip);

// PUT /api/trips/:tripId/status - Update trip status
router.put("/:tripId/status", updateTripStatus);

export default router;
