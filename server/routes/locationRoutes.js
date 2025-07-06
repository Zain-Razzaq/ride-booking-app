import express from "express";
import {
  getLocations,
  calculatePrice,
} from "../controllers/locationController.js";

/**
 * Location Routes - Endpoints for location data and pricing
 */

const router = express.Router();

// Retrieve all available pickup/drop locations
router.get("/", getLocations);

// Calculate trip fare based on distance and vehicle type
router.get("/calculate-price", calculatePrice);

export default router;
