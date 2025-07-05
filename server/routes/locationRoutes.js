import express from "express";
import {
  getLocations,
  calculatePrice,
} from "../controllers/locationController.js";

const router = express.Router();

// Get all locations
router.get("/", getLocations);

// Calculate price based on distance and ride type
router.get("/calculate-price", calculatePrice);

export default router;
