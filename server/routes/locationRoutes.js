import express from "express";
import { getAllLocations } from "../database/locations.js";

const router = express.Router();

// Hardcoded locations as fallback
const hardcodedLocations = [
  { id: 1, name: "City Center", address: "Main Street, Downtown" },
  { id: 2, name: "Airport", address: "Allama Iqbal International Airport" },
  { id: 3, name: "Train Station", address: "Lahore Railway Station" },
  { id: 4, name: "Emporium Mall", address: "Johar Town" },
  { id: 5, name: "University", address: "University of Lahore" },
  { id: 6, name: "Jinnah Hospital", address: "Jinnah Hospital" },
  { id: 7, name: "Gadaffi Stadium", address: "Gadaffi Stadium" },
  { id: 8, name: "Faisal Town", address: "Faisal Town" },
  { id: 9, name: "DHA Raya", address: "DHA Raya" },
  { id: 10, name: "Lake City", address: "Lake City" },
];

// GET /api/locations - Get all available locations
router.get("/", async (req, res) => {
  try {
    // Try to get from database first
    const result = await getAllLocations();

    if (result.success && result.locations.length > 0) {
      res.json({
        success: true,
        data: result.locations,
        message: "Locations retrieved successfully",
      });
    } else {
      // Fallback to hardcoded locations
      res.json({
        success: true,
        data: hardcodedLocations,
        message: "Locations retrieved successfully (from cache)",
      });
    }
  } catch (error) {
    // If database fails, use hardcoded locations
    console.log("Database connection failed, using hardcoded locations");
    res.json({
      success: true,
      data: hardcodedLocations,
      message: "Locations retrieved successfully (from cache)",
    });
  }
});

export default router;
