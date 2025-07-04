import express from "express";

const router = express.Router();

// Predefined 10 locations for the ride booking app
const locations = [
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
router.get("/", (req, res) => {
  try {
    res.json({
      success: true,
      data: locations,
      message: "Locations retrieved successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve locations",
      error: error.message,
    });
  }
});

export default router;
