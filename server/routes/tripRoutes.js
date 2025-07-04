import express from "express";
import {
  bookTrip,
  getUserTripsController,
  getDriverTripsController,
  getTripDetails,
  updateTrip,
  getPendingTripsController,
} from "../controllers/tripController.js";
import { verifyToken } from "../controllers/authController.js";

const router = express.Router();

// All trip routes require authentication
router.use(verifyToken);

// Book a new trip
router.post("/book", bookTrip);

// Get user's trips (for passengers)
router.get("/user", getUserTripsController);

// Get driver's trips
router.get("/driver", getDriverTripsController);

// Get pending trips (for drivers to see available trips)
router.get("/pending", getPendingTripsController);

// Get specific trip details
router.get("/:tripId", getTripDetails);

// Update trip status
router.patch("/:tripId", updateTrip);

export default router;
